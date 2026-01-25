import { post, get } from './api'
import logger from '../utils/logger'

/**
 * CheckoutService
 * 
 * Serviço para processamento de checkout e pedidos
 * Implementação híbrida: mock local + estrutura para API real
 */

// Mock data para desenvolvimento
const USE_MOCK = false // Mudar para false quando usar API real

// Mock de pedidos criados
let mockOrders = []
let mockOrderIdCounter = 1

/**
 * Criar um novo pedido
 * @param {Object} orderData - Dados do pedido
 * @param {Array} orderData.items - Itens do carrinho
 * @param {Object} orderData.endereco - Endereço de entrega
 * @param {Object} orderData.pagamento - Dados do pagamento
 * @param {number} orderData.total - Valor total do pedido
 * @returns {Promise<Object>} - Pedido criado
 */
export const createOrder = async (orderData) => {
  try {
    logger.info({ orderData }, 'Iniciando criação de pedido')

    // Validação básica
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Carrinho vazio. Adicione itens antes de finalizar.')
    }

    if (!orderData.endereco) {
      throw new Error('Endereço de entrega é obrigatório')
    }

    if (!orderData.total || orderData.total <= 0) {
      throw new Error('Valor total inválido')
    }

    // Try API implementation first
    if (!USE_MOCK) {
      try {
        logger.info('Tentando criar pedido via API real')
        return await createOrderAPI(orderData)
      } catch (apiError) {
        logger.warn({ error: apiError }, 'API falhou, usando fallback mock')
        
        // Se for erro de autenticação ou servidor, não tentar mock
        if (apiError.response?.status === 401 || apiError.response?.status === 403) {
          throw apiError
        }
        
        console.warn('⚠️ API de checkout indisponível. Usando modo mock como fallback.')
        return await createOrderMock(orderData)
      }
    }

    // Mock implementation direto
    logger.info('Usando implementação mock')
    return await createOrderMock(orderData)

  } catch (error) {
    logger.error({ error, orderData }, 'Erro ao criar pedido')
    throw error
  }
}

/**
 * Implementação Mock para criação de pedido
 */
async function createOrderMock(orderData) {
  console.warn('🔄 Usando modo MOCK para criação de pedido (fallback)')
  
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 1500))

  const newOrder = {
    id: `PED${String(mockOrderIdCounter++).padStart(6, '0')}`,
    dataCriacao: new Date().toISOString(),
    status: 'PENDENTE',
    itens: orderData.items.map(item => {
      const precoItem = typeof item.preco === 'object' ? item.preco.valor : item.preco
      return {
        id: item.id,
        produto: {
          id: item.id,
          nome: item.nome,
          imagem: item.imagem
        },
        quantidade: item.quantidade,
        precoUnitario: precoItem,
        precoOriginal: item.precoOriginal,
        subtotal: precoItem * item.quantidade
      }
    }),
    endereco: orderData.endereco,
    pagamento: {
      metodo: orderData.pagamento?.metodo || 'PIX',
      status: 'PENDENTE',
      ...orderData.pagamento
    },
    valores: {
      subtotal: orderData.valores?.subtotal || calcularSubtotal(orderData.items),
      desconto: orderData.valores?.desconto || calcularDesconto(orderData.items),
      frete: orderData.valores?.frete || 15.00,
      total: orderData.total
    },
    usuario: {
      id: orderData.usuario?.id || '1',
      nome: orderData.usuario?.nome || 'Usuário Teste',
      email: orderData.usuario?.email || 'teste@exemplo.com'
    }
  }

  // Salvar no mock storage
  mockOrders.push(newOrder)
  
  // Salvar no localStorage para persistência
  localStorage.setItem('mockOrders', JSON.stringify(mockOrders))
  localStorage.setItem('lastOrder', JSON.stringify(newOrder))

  logger.info({ orderId: newOrder.id }, 'Pedido criado com sucesso (mock)')

  return newOrder
}

/**
 * Formatar endereço no formato brasileiro
 * @param {Object} endereco - Objeto de endereço
 * @returns {String} - Endereço formatado
 */
export const formatarEndereco = (endereco) => {
  if (!endereco) return ''
  
  const partes = []
  
  // Rua + número
  if (endereco.rua) {
    const ruaNumero = endereco.numero ? `${endereco.rua}, ${endereco.numero}` : endereco.rua
    partes.push(ruaNumero)
  }
  
  // Bairro
  if (endereco.bairro) {
    partes.push(endereco.bairro)
  }
  
  // Cidade + Estado
  if (endereco.cidade) {
    const cidadeEstado = endereco.estado ? `${endereco.cidade} - ${endereco.estado}` : endereco.cidade
    partes.push(cidadeEstado)
  }
  
  // Complemento (entre parênteses se existir)
  let enderecoFormatado = partes.join(', ')
  if (endereco.complemento && endereco.complemento.trim()) {
    enderecoFormatado += ` (${endereco.complemento.trim()})`
  }
  
  return enderecoFormatado
}

/**
 * Implementação API para criação de pedido
 */
async function createOrderAPI(orderData) {
  // Montar objeto no formato esperado pelo backend Java (CheckoutRequest)
  const enderecoFormatado = formatarEndereco(orderData.endereco)
  const checkoutRequest = {
    enderecoEntrega: enderecoFormatado,
    observacoes: orderData.observacoes || ''
  }

  logger.info('Criando pedido via API...')
  const pedido = await post('/checkout/finalizar', checkoutRequest)
  
  logger.info({ pedidoId: pedido.id }, 'Pedido criado, buscando detalhes completos...')
  
  try {
    // Buscar detalhes completos do pedido com itens
    const pedidoDetalhado = await get(`/pedidos/${pedido.id}`)
    
    // Combinar dados básicos com detalhes para SuccessModal
    const mergedOrder = {
      ...pedidoDetalhado,
      // Garantir que temos os dados do frontend
      pagamento: {
        metodo: orderData.pagamento?.metodo || 'PIX',
        status: 'PENDENTE',
        ...orderData.pagamento
      },
      // Mapear campos do backend para frontend
      total: pedido.valorTotal || pedidoDetalhado.valorTotal,
      valores: {
        subtotal: pedido.subtotal || pedidoDetalhado.subtotal,
        desconto: pedido.valorDesconto || pedidoDetalhado.valorDesconto,
        frete: pedido.valorFrete || pedidoDetalhado.valorFrete,
        total: pedido.valorTotal || pedidoDetalhado.valorTotal
      },
      // Garantir campos de endereço
      endereco: orderData.endereco,
      // Garantir dados do usuário
      usuario: orderData.usuario
    }
    
    logger.info({ pedidoId: pedido.id }, 'Detalhes do pedido obtidos com sucesso')
    return mergedOrder
    
  } catch (detailsError) {
    logger.warn({ error: detailsError, pedidoId: pedido.id }, 'Não foi possível obter detalhes do pedido, usando dados básicos')
    
    // Se não conseguir detalhes, retornar dados básicos formatados
    return {
      id: pedido.id,
      dataCriacao: pedido.dataCriacao,
      status: pedido.status,
      pagamento: {
        metodo: orderData.pagamento?.metodo || 'PIX',
        status: 'PENDENTE',
        ...orderData.pagamento
      },
      valores: {
        subtotal: pedido.subtotal,
        desconto: pedido.valorDesconto,
        frete: pedido.valorFrete,
        total: pedido.valorTotal
      },
      total: pedido.valorTotal,
      itens: orderData.items.map(item => ({
        id: item.id,
        produto: {
          id: item.id,
          nome: item.nome,
          imagem: item.imagem
        },
        quantidade: item.quantidade,
        precoUnitario: typeof item.preco === 'object' ? item.preco.valor : item.preco,
        subtotal: (typeof item.preco === 'object' ? item.preco.valor : item.preco) * item.quantidade
      })),
      endereco: orderData.endereco,
      usuario: orderData.usuario
    }
  }
}

/**
 * Buscar pedido por ID
 * @param {string} orderId - ID do pedido
 * @returns {Promise<Object>} - Pedido encontrado
 */
export const getOrderById = async (orderId) => {
  try {
    logger.info({ orderId }, 'Buscando pedido por ID')

    if (USE_MOCK) {
      return await getOrderByIdMock(orderId)
    }

    return await getOrderByIdAPI(orderId)

  } catch (error) {
    logger.error({ error, orderId }, 'Erro ao buscar pedido')
    throw error
  }
}

/**
 * Implementação Mock para buscar pedido por ID
 */
async function getOrderByIdMock(orderId) {
  // Carregar do localStorage
  const stored = localStorage.getItem('mockOrders')
  if (stored) {
    mockOrders = JSON.parse(stored)
  }

  const order = mockOrders.find(o => o.id === orderId)
  
  if (!order) {
    throw new Error('Pedido não encontrado')
  }

  return order
}

/**
 * Implementação API para buscar pedido por ID
 */
async function getOrderByIdAPI(orderId) {
  const response = await get(`/pedidos/${orderId}`)
  return response
}

/**
 * Calcular subtotal dos itens
 */
function calcularSubtotal(items) {
  return items.reduce((total, item) => {
    const precoItem = typeof item.preco === 'object' ? item.preco.valor : item.preco
    return total + (precoItem * item.quantidade)
  }, 0)
}

/**
 * Calcular desconto total dos itens
 */
function calcularDesconto(items) {
  return items.reduce((total, item) => {
    const precoItem = typeof item.preco === 'object' ? item.preco.valor : item.preco
    const precoOriginalItem = typeof item.precoOriginal === 'object' ? item.precoOriginal.valor : item.precoOriginal
    
    if (precoOriginalItem > precoItem) {
      return total + ((precoOriginalItem - precoItem) * item.quantidade)
    }
    return total
  }, 0)
}

/**
 * Calcular frete (simulado)
 */
export const calcularFrete = (subtotal, endereco) => {
  // Frete grátis acima de R$ 200
  if (subtotal >= 200) return 0
  
  // Simular diferentes valores por região
  const cep = endereco?.cep
  if (!cep) return 15.00

  // Lógica simples baseada no CEP
  const firstDigit = parseInt(cep[0])
  switch (firstDigit) {
    case 0: case 1: case 2: // Norte, Nordeste
      return 30.00
    case 3: case 4: case 5: // Sudeste, Centro-Oeste
      return 15.00
    case 6: case 7: case 8: case 9: // Sul
      return 20.00
    default:
      return 15.00
  }
}

/**
 * Validar dados do endereço
 */
export const validarEndereco = (endereco) => {
  const errors = {}

  if (!endereco.cep || endereco.cep.length < 8) {
    errors.cep = 'CEP inválido'
  }

  if (!endereco.rua || endereco.rua.trim().length < 5) {
    errors.rua = 'Rua é obrigatória'
  }

  if (!endereco.numero || endereco.numero.trim().length < 1) {
    errors.numero = 'Número é obrigatório'
  }

  if (!endereco.bairro || endereco.bairro.trim().length < 3) {
    errors.bairro = 'Bairro é obrigatório'
  }

  if (!endereco.cidade || endereco.cidade.trim().length < 3) {
    errors.cidade = 'Cidade é obrigatória'
  }

  if (!endereco.estado || endereco.estado.length !== 2) {
    errors.estado = 'Estado inválido'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Limpar dados mock (para testes)
 */
export const clearMockData = () => {
  mockOrders = []
  mockOrderIdCounter = 1
  localStorage.removeItem('mockOrders')
  localStorage.removeItem('lastOrder')
}

/**
 * Obter último pedido criado (mock)
 */
export const getLastOrder = () => {
  if (USE_MOCK) {
    const stored = localStorage.getItem('lastOrder')
    return stored ? JSON.parse(stored) : null
  }
  return null
}