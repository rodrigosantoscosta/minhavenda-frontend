import storageUtil from '../utils/storageUtil'
import logger from '../utils/logger'

/**
 * notificationService
 *
 * Recebe eventos de status de pedidos em tempo real via Server-Sent Events (SSE).
 *
 * O endpoint GET /api/pedidos/stream é alimentado pelo PedidoRabbitMQConsumer —
 * cada vez que um evento RabbitMQ é processado, o backend empurra o evento SSE
 * para o emitter registrado do usuário autenticado.
 *
 * Por que fetch em vez de EventSource nativo?
 * O EventSource nativo não suporta headers customizados, então não é possível
 * enviar o JWT via Authorization. Usando fetch + ReadableStream, mantemos
 * a autenticação padrão sem precisar de mudanças no backend.
 *
 * Eventos recebidos (SSE event name → ação):
 *   pedido.criado    → notificação new_order
 *   pedido.pago      → notificação status_change
 *   pedido.enviado   → notificação status_change
 *   pedido.cancelado → notificação cancelled
 */

const KNOWN_STATUSES_KEY = 'mv_order_statuses'

let abortController = null
let reconnectTimer = null
const RECONNECT_DELAY_MS = 5_000

// ─────────────────────────────────────────────────────────────────────────────
// Mapeamento de evento SSE → notificação legível
// ─────────────────────────────────────────────────────────────────────────────

const EVENT_MAP = {
  'pedido.criado': (data) => ({
    type: 'new_order',
    title: 'Pedido criado',
    message: `Pedido #${shortId(data.pedidoId)} criado — R$ ${data.valorTotal?.toFixed(2) ?? '—'}`,
    orderId: data.pedidoId,
  }),
  'pedido.pago': (data) => ({
    type: 'status_change',
    title: 'Pagamento confirmado',
    message: `Pedido #${shortId(data.pedidoId)} — pagamento via ${data.metodoPagamento ?? '—'} confirmado.`,
    orderId: data.pedidoId,
  }),
  'pedido.enviado': (data) => ({
    type: 'status_change',
    title: 'Pedido enviado',
    message: `Pedido #${shortId(data.pedidoId)} — rastreio ${data.codigoRastreio ?? '—'} (${data.transportadora ?? '—'}).`,
    orderId: data.pedidoId,
  }),
  'pedido.cancelado': (data) => ({
    type: 'cancelled',
    title: 'Pedido cancelado',
    message: `Pedido #${shortId(data.pedidoId)} cancelado: ${data.motivo ?? 'sem motivo informado'}.`,
    orderId: data.pedidoId,
  }),
}

function shortId(uuid) {
  return uuid?.slice(-6) ?? '??????'
}

// ─────────────────────────────────────────────────────────────────────────────
// Parser de SSE sobre fetch ReadableStream
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Lê o stream SSE linha a linha.
 * O protocolo SSE usa blocos separados por linha em branco:
 *   event: pedido.pago\n
 *   data: {...}\n
 *   \n
 */
async function readSseStream(response, onEvent) {
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')

  let buffer = ''
  let currentEventName = ''
  let currentData = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split('\n')
    // Manter a última linha incompleta no buffer
    buffer = lines.pop()

    for (const line of lines) {
      if (line.startsWith('event:')) {
        currentEventName = line.slice(6).trim()
      } else if (line.startsWith('data:')) {
        currentData = line.slice(5).trim()
      } else if (line === '') {
        // Fim do bloco — disparar evento se tiver dados
        if (currentEventName && currentData) {
          try {
            const parsed = JSON.parse(currentData)
            onEvent(currentEventName, parsed)
          } catch {
            logger.debug({ raw: currentData }, 'SSE data não é JSON válido — ignorado')
          }
        }
        currentEventName = ''
        currentData = ''
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Conexão SSE principal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Conectar ao endpoint SSE do backend e escutar eventos de pedidos.
 * Reconecta automaticamente em caso de erro de rede.
 *
 * @param {Function} addNotification - função do useNotifications
 * @param {string} token - JWT do usuário autenticado
 */
async function connectSse(addNotification, token) {
  const baseUrl = import.meta.env.VITE_API_URL
  const url = `${baseUrl}/pedidos/stream`

  try {
    logger.info('Conectando ao SSE de pedidos...')

    abortController = new AbortController()

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      signal: abortController.signal,
    })

    if (!response.ok) {
      throw new Error(`SSE HTTP ${response.status}`)
    }

    logger.info('Conexão SSE estabelecida')

    await readSseStream(response, (eventName, data) => {
      const builder = EVENT_MAP[eventName]
      if (!builder) {
        logger.debug({ eventName }, 'Evento SSE desconhecido — ignorado')
        return
      }

      const notification = builder(data)
      addNotification(notification)

      // Manter mapa de statuses sincronizado (compatibilidade com registerOrderStatus)
      if (data.pedidoId) {
        const statusByEvent = {
          'pedido.criado': 'PENDENTE',
          'pedido.pago': 'PAGO',
          'pedido.enviado': 'ENVIADO',
          'pedido.cancelado': 'CANCELADO',
        }
        const newStatus = statusByEvent[eventName]
        if (newStatus) {
          const known = storageUtil.getItem(KNOWN_STATUSES_KEY, {})
          storageUtil.setItem(KNOWN_STATUSES_KEY, { ...known, [data.pedidoId]: newStatus })
        }
      }

      logger.info({ eventName, pedidoId: data.pedidoId }, 'Evento SSE processado')
    })

    // Stream encerrou normalmente (servidor fechou) — reconectar
    logger.warn('Stream SSE encerrado pelo servidor — reconectando em 5s')
    scheduleReconnect(addNotification, token)
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.info('Conexão SSE encerrada (logout)')
      return
    }
    logger.warn({ error: error.message }, 'Erro na conexão SSE — reconectando em 5s')
    scheduleReconnect(addNotification, token)
  }
}

function scheduleReconnect(addNotification, token) {
  if (reconnectTimer !== null) return
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    connectSse(addNotification, token)
  }, RECONNECT_DELAY_MS)
}

// ─────────────────────────────────────────────────────────────────────────────
// API pública — compatível com os hooks existentes (AuthContext chama start/stop)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Iniciar a conexão SSE.
 * Deve ser chamado quando o usuário fizer login.
 *
 * @param {Function} addNotification - função do useNotifications
 * @param {string} token - JWT do usuário autenticado
 */
export function startPolling(addNotification, token) {
  if (abortController !== null) return // já conectado

  if (!token) {
    logger.warn('startPolling chamado sem token — SSE não será conectado')
    return
  }

  connectSse(addNotification, token)
}

/**
 * Encerrar a conexão SSE.
 * Deve ser chamado quando o usuário fizer logout.
 */
export function stopPolling() {
  if (reconnectTimer !== null) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  if (abortController !== null) {
    abortController.abort()
    abortController = null
    logger.info('Conexão SSE encerrada (logout)')
  }
}

/**
 * Registrar um novo pedido no mapa de statuses conhecidos.
 * Chamado imediatamente após o checkout.
 *
 * @param {string} orderId
 * @param {string} status
 */
export function registerOrderStatus(orderId, status) {
  const knownStatuses = storageUtil.getItem(KNOWN_STATUSES_KEY, {})
  storageUtil.setItem(KNOWN_STATUSES_KEY, { ...knownStatuses, [orderId]: status })
}
