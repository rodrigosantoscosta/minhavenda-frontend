import { get, post } from './api'
import logger from '../utils/logger'
import { generateMockOrders as fakerGenerateMockOrders } from '../mocks/factories'
import type { Order, OrderItem, OrderPaginationResult, CancelOrderRequest, OrderStatus } from '../types'

/**
 * Mapear status do backend para o formato do frontend.
 * O backend usa CRIADO como status inicial; o frontend usa PENDENTE.
 * IMPORTANT: this mapping must be applied BEFORE any status filtering.
 */
function mapStatus(status: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    'CRIADO': 'PENDENTE',
    'PAGO': 'PAGO',
    'ENVIADO': 'ENVIADO',
    'ENTREGUE': 'ENTREGUE',
    'CANCELADO': 'CANCELADO',
  }
  return statusMap[status] || status as OrderStatus
}

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const setOrderServiceMode = (useMock: boolean): void => {
  logger.info({ useMock }, 'Modo do orderService alterado')
}

let mockUserOrders: Order[] = []

interface GetMyOrdersOptions {
  status?: OrderStatus
  page?: number
  limit?: number
}

export const getMyOrders = async (options: GetMyOrdersOptions = {}): Promise<OrderPaginationResult> => {
  try {
    logger.info({ options }, 'Buscando pedidos do usuário')
    if (USE_MOCK) return await getMyOrdersMock(options)
    return await getMyOrdersAPI(options)
  } catch (error) {
    logger.error({ error, options }, 'Erro ao buscar pedidos do usuário')
    throw error
  }
}

async function getMyOrdersMock(options: GetMyOrdersOptions = {}): Promise<OrderPaginationResult> {
  await new Promise(resolve => setTimeout(resolve, 800))
  const stored = localStorage.getItem('mockOrders')
  if (stored) mockUserOrders = JSON.parse(stored)
  if (mockUserOrders.length === 0) {
    mockUserOrders = generateMockOrders()
    localStorage.setItem('mockOrders', JSON.stringify(mockUserOrders))
  }
  let filteredOrders = [...mockUserOrders]
  if (options.status) {
    filteredOrders = filteredOrders.filter(order => order.status === options.status)
  }
  filteredOrders.sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())
  const page = options.page || 1
  const limit = options.limit || 10
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)
  return {
    orders: paginatedOrders,
    pagination: {
      page,
      limit,
      total: filteredOrders.length,
      totalPages: Math.ceil(filteredOrders.length / limit),
      hasNext: endIndex < filteredOrders.length,
      hasPrev: page > 1,
    },
  }
}

async function getMyOrdersAPI(options: GetMyOrdersOptions = {}): Promise<OrderPaginationResult> {
  const response = await get<Order[]>('/meus-pedidos')
  // FIX: apply mapStatus BEFORE filtering — backend sends 'CRIADO', frontend filters by 'PENDENTE'
  const mappedOrders: Order[] = response.map(order => ({
    id: order.id,
    dataCriacao: order.dataCriacao,
    status: mapStatus(order.status as string),
    itens: [],
    endereco: (order as Order).enderecoEntrega ? {
      rua: (order as Order).enderecoEntrega as string,
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    } : null,
    pagamento: {
      metodo: 'PIX',
      status: (order as Order).dataPagamento ? 'PAGO' : 'PENDENTE',
    },
    valores: {
      subtotal: (order as Order).subtotal || 0,
      desconto: (order as Order).valorDesconto || 0,
      frete: (order as Order).valorFrete || 0,
      total: (order as Order).valorTotal || 0,
    },
    quantidadeItens: (order as Order).quantidadeItens || 0,
    usuario: { id: '1', nome: 'Usuário Logado', email: 'usuario@exemplo.com', role: null, tipo: null },
  }))
  let filteredOrders = mappedOrders
  if (options.status) {
    filteredOrders = mappedOrders.filter(order => order.status === options.status)
  }
  const page = options.page || 1
  const limit = options.limit || 10
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  return {
    orders: filteredOrders.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: filteredOrders.length,
      totalPages: Math.ceil(filteredOrders.length / limit),
      hasNext: endIndex < filteredOrders.length,
      hasPrev: page > 1,
    },
  }
}

export const getOrderDetails = async (orderId: string | number): Promise<Order> => {
  try {
    logger.info({ orderId }, 'Buscando detalhes do pedido')
    if (USE_MOCK) return await getOrderDetailsMock(orderId)
    return await getOrderDetailsAPI(orderId)
  } catch (error) {
    logger.error({ error, orderId }, 'Erro ao buscar detalhes do pedido')
    throw error
  }
}

async function getOrderDetailsMock(orderId: string | number): Promise<Order> {
  const stored = localStorage.getItem('mockOrders')
  if (stored) mockUserOrders = JSON.parse(stored)
  const order = mockUserOrders.find(o => o.id === orderId)
  if (!order) throw new Error('Pedido não encontrado')
  return {
    ...order,
    rastreamento: generateTrackingInfo(order.status as string),
    historico: generateOrderHistory(order),
    estimativaEntrega: calculateDeliveryEstimate(order),
  }
}

async function getOrderDetailsAPI(orderId: string | number): Promise<Order> {
  const response = await get<Order>(`/pedidos/${orderId}`)
  return {
    id: response.id,
    dataCriacao: response.dataCriacao,
    status: mapStatus(response.status as string),
    itens: response.itens ? (response.itens.map(item => ({
      id: item.id,
      produtoId: item.produtoId,
      produto: {
        id: item.produtoId,
        nome: item.produtoNome,
        urlImagem: `https://picsum.photos/seed/prod-${item.produtoId}/100/100`,
      },
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      subtotal: item.subtotal,
    })) as OrderItem[]) : [],
    endereco: (response as Order).enderecoEntrega ? {
      rua: (response as Order).enderecoEntrega as string,
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    } : null,
    pagamento: {
      metodo: 'PIX',
      status: (response as Order).dataPagamento ? 'PAGO' : 'PENDENTE',
    },
    valores: {
      subtotal: (response as Order).subtotal || 0,
      desconto: (response as Order).valorDesconto || 0,
      frete: (response as Order).valorFrete || 0,
      total: (response as Order).valorTotal || 0,
    },
    quantidadeItens: (response as Order).quantidadeItens || 0,
    usuario: { id: '1', nome: 'Usuário Logado', email: 'usuario@exemplo.com', role: null, tipo: null },
    rastreamento: generateTrackingInfo(response.status as string),
    historico: generateOrderHistory(response),
    estimativaEntrega: calculateDeliveryEstimate(response),
  }
}

export const cancelOrder = async (orderId: string | number, motivo: string = ''): Promise<Order> => {
  try {
    logger.info({ orderId, motivo }, 'Cancelando pedido')
    if (USE_MOCK) return await cancelOrderMock(orderId, motivo)
    return await cancelOrderAPI(orderId, motivo)
  } catch (error) {
    logger.error({ error, orderId }, 'Erro ao cancelar pedido')
    throw error
  }
}

async function cancelOrderMock(orderId: string | number, motivo: string): Promise<Order> {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const stored = localStorage.getItem('mockOrders')
  if (stored) mockUserOrders = JSON.parse(stored)
  const orderIndex = mockUserOrders.findIndex(o => o.id === orderId)
  if (orderIndex === -1) throw new Error('Pedido não encontrado')
  const order = mockUserOrders[orderIndex]
  if (order.status === 'ENVIADO' || order.status === 'ENTREGUE') throw new Error('Este pedido não pode mais ser cancelado')
  mockUserOrders[orderIndex] = {
    ...order,
    status: 'CANCELADO',
    dataCancelamento: new Date().toISOString(),
    motivoCancelamento: motivo,
  }
  localStorage.setItem('mockOrders', JSON.stringify(mockUserOrders))
  return mockUserOrders[orderIndex]
}

async function cancelOrderAPI(orderId: string | number, motivo: string): Promise<Order> {
  const response = await post<Order>(`/pedidos/${orderId}/cancelar`, {
    motivo: motivo || 'Cancelado pelo cliente',
  } satisfies CancelOrderRequest)
  return {
    id: response.id,
    dataCriacao: response.dataCriacao,
    status: mapStatus(response.status as string),
    itens: [],
    endereco: (response as Order).enderecoEntrega ? {
      rua: (response as Order).enderecoEntrega as string,
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    } : null,
    pagamento: {
      metodo: 'PIX',
      status: (response as Order).dataPagamento ? 'PAGO' : 'PENDENTE',
    },
    valores: {
      subtotal: (response as Order).subtotal || 0,
      desconto: (response as Order).valorDesconto || 0,
      frete: (response as Order).valorFrete || 0,
      total: (response as Order).valorTotal || 0,
    },
    quantidadeItens: (response as Order).quantidadeItens || 0,
    usuario: { id: '1', nome: 'Usuário Logado', email: 'usuario@exemplo.com', role: null, tipo: null },
    dataCancelamento: new Date().toISOString(),
    motivoCancelamento: motivo,
  }
}

// FIX: accept optional metodoPagamento so callers can specify payment method
// Default is 'PIX' — the client pay button has no payment method selector
export const payOrder = async (orderId: string | number, metodoPagamento: string = 'PIX'): Promise<unknown> => {
  try {
    logger.info({ orderId, metodoPagamento }, 'Simulando pagamento do pedido')
    if (USE_MOCK) return await payOrderMock(orderId)
    return await payOrderAPI(orderId, metodoPagamento)
  } catch (error) {
    logger.error({ error, orderId }, 'Erro ao simular pagamento')
    throw error
  }
}

async function payOrderAPI(orderId: string | number, metodoPagamento: string = 'PIX'): Promise<unknown> {
  // FIX: backend requires { metodoPagamento } — was sending empty body → 400
  const response = await post(`/pedidos/${orderId}/pagar`, { metodoPagamento })
  return response
}

async function payOrderMock(orderId: string | number): Promise<Order> {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const stored = localStorage.getItem('mockOrders')
  if (!stored) throw new Error('Pedido não encontrado')
  let orders = JSON.parse(stored) as Order[]
  const orderIndex = orders.findIndex(o => o.id === orderId)
  if (orderIndex === -1) throw new Error('Pedido não encontrado')
  const order = orders[orderIndex]
  if (order.status !== 'CRIADO') throw new Error('Este pedido não pode ser pago')
  orders[orderIndex] = {
    ...order,
    status: 'PAGO',
    dataPagamento: new Date().toISOString(),
    pagamento: { ...order.pagamento, status: 'PAGO' as const },
  }
  localStorage.setItem('mockOrders', JSON.stringify(orders))
  return orders[orderIndex]
}

export const clearOrderMockData = (): void => {
  mockUserOrders = []
  localStorage.removeItem('mockOrders')
  localStorage.removeItem('lastOrder')
}

function generateMockOrders(): Order[] {
  return fakerGenerateMockOrders(8)
}

interface TrackingInfo {
  codigo: string | null
  status: string
  ultimaAtualizacao: string
}

function generateTrackingInfo(status: string): TrackingInfo | null {
  if (status === 'PENDENTE' || status === 'CANCELADO') return null
  const codigos: Record<string, string> = {
    'PAGO': 'AGUARDANDO_ENVIO',
    'ENVIADO': 'BR123456789BR',
    'ENTREGUE': 'BR123456789BR',
  }
  return {
    codigo: codigos[status] || null,
    status: status === 'ENTREGUE' ? 'Entregue' : 'Em trânsito',
    ultimaAtualizacao: new Date().toISOString(),
  }
}

interface OrderHistoryEntry {
  data: string
  status: string
  descricao: string
}

function generateOrderHistory(order: Order): OrderHistoryEntry[] {
  const history: OrderHistoryEntry[] = [{
    data: order.dataCriacao,
    status: 'PENDENTE',
    descricao: 'Pedido criado e aguardando pagamento',
  }]
  if (['PAGO', 'ENVIADO', 'ENTREGUE'].includes(order.status)) {
    history.push({
      data: new Date(new Date(order.dataCriacao).getTime() + 3600000).toISOString(),
      status: 'PAGO',
      descricao: 'Pagamento confirmado',
    })
  }
  if (['ENVIADO', 'ENTREGUE'].includes(order.status)) {
    history.push({
      data: new Date(new Date(order.dataCriacao).getTime() + 7200000).toISOString(),
      status: 'ENVIADO',
      descricao: 'Pedido enviado para transportadora',
    })
  }
  if (order.status === 'ENTREGUE') {
    history.push({
      data: new Date(new Date(order.dataCriacao).getTime() + 86400000).toISOString(),
      status: 'ENTREGUE',
      descricao: 'Pedido entregue com sucesso',
    })
  }
  if (order.status === 'CANCELADO') {
    history.push({
      data: new Date(new Date(order.dataCriacao).getTime() + 3600000).toISOString(),
      status: 'CANCELADO',
      descricao: order.motivoCancelamento || 'Pedido cancelado pelo usuário',
    })
  }
  return history
}

function calculateDeliveryEstimate(order: Order): string | null {
  if (order.status === 'ENTREGUE' || order.status === 'CANCELADO') return null
  let dataEstimada = new Date(order.dataCriacao)
  let diasAdicionados = 0
  while (diasAdicionados < 7) {
    dataEstimada.setDate(dataEstimada.getDate() + 1)
    if (dataEstimada.getDay() !== 0 && dataEstimada.getDay() !== 6) diasAdicionados++
  }
  return dataEstimada.toISOString()
}

export const finalizeCheckout = async (checkoutData: Record<string, unknown>): Promise<Order> => {
  try {
    logger.info({ checkoutData }, 'Finalizando checkout')
    if (USE_MOCK) return await finalizeCheckoutMock(checkoutData)
    return await finalizeCheckoutAPI(checkoutData)
  } catch (error) {
    logger.error({ error, checkoutData }, 'Erro ao finalizar checkout')
    throw error
  }
}

async function finalizeCheckoutAPI(checkoutData: Record<string, unknown>): Promise<Order> {
  const response = await post<Order>('/checkout/finalizar', checkoutData)
  return {
    id: response.id,
    dataCriacao: response.dataCriacao,
    status: mapStatus(response.status as string),
    itens: [],
    endereco: (response as Order).enderecoEntrega ? {
      rua: (response as Order).enderecoEntrega as string,
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    } : null,
    pagamento: { metodo: 'PIX', status: 'PENDENTE' },
    valores: {
      subtotal: (response as Order).subtotal || 0,
      desconto: (response as Order).valorDesconto || 0,
      frete: (response as Order).valorFrete || 0,
      total: (response as Order).valorTotal || 0,
    },
    quantidadeItens: (response as Order).quantidadeItens || 0,
    usuario: { id: '1', nome: 'Usuário Logado', email: 'usuario@exemplo.com', role: null, tipo: null },
    observacoes: (response as Order).observacoes,
  }
}

async function finalizeCheckoutMock(checkoutData: Record<string, unknown>): Promise<Order> {
  await new Promise(resolve => setTimeout(resolve, 1500))
  const mockOrder: Order = {
    id: `PED${Date.now()}`,
    dataCriacao: new Date().toISOString(),
    status: 'CRIADO',
    itens: [],
    endereco: {
      rua: (checkoutData.enderecoEntrega as string) || 'Rua das Flores',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
    },
    pagamento: { metodo: 'PIX', status: 'PENDENTE' },
    valores: { subtotal: 1000, desconto: 0, frete: 0, total: 1000 },
    quantidadeItens: 1,
    usuario: { id: '1', nome: 'Usuário Teste', email: 'teste@exemplo.com', role: null, tipo: null },
    observacoes: checkoutData.observacoes as string,
  }
  const stored = localStorage.getItem('mockOrders')
  let orders = stored ? JSON.parse(stored) as Order[] : []
  orders.push(mockOrder)
  localStorage.setItem('mockOrders', JSON.stringify(orders))
  return mockOrder
}
