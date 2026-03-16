import { get, post } from './api'
import logger from '../utils/logger'

/**
 * Mapear status do backend para o formato do frontend.
 * O backend usa CRIADO como status inicial; o frontend usa PENDENTE.
 * IMPORTANT: this mapping must be applied BEFORE any status filtering.
 */
function mapStatus(status) {
  const statusMap = {
    'CRIADO': 'PENDENTE',
    'PAGO': 'PAGO',
    'ENVIADO': 'ENVIADO',
    'ENTREGUE': 'ENTREGUE',
    'CANCELADO': 'CANCELADO'
  }
  return statusMap[status] || status
}

/**
 * OrderService
 *
 * Serviço para gerenciamento de pedidos do usuário
 * Implementação híbrida: mock local + estrutura para API real
 *
 * Endpoints disponíveis no backend:
 * - GET /api/meus-pedidos - Listar pedidos do usuário
 * - GET /api/pedidos/{id} - Buscar detalhes do pedido
 * - POST /api/pedidos/{id}/pagar - Simular pagamento
 * - POST /api/pedidos/{id}/cancelar - Cancelar pedido
 * - POST /api/checkout/finalizar - Finalizar checkout
 */

// Mock data para desenvolvimento
const USE_MOCK = false // Mudar para false quando usar API real

export const setOrderServiceMode = (useMock) => {
  logger.info({ useMock }, 'Modo do orderService alterado')
}

let mockUserOrders = []

export const getMyOrders = async (options = {}) => {
  try {
    logger.info({ options }, 'Buscando pedidos do usuário')
    if (USE_MOCK) return await getMyOrdersMock(options)
    return await getMyOrdersAPI(options)
  } catch (error) {
    logger.error({ error, options }, 'Erro ao buscar pedidos do usuário')
    throw error
  }
}

async function getMyOrdersMock(options = {}) {
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

  filteredOrders.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))

  const page = options.page || 1
  const limit = options.limit || 10
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  return {
    orders: paginatedOrders,
    pagination: {
      page, limit,
      total: filteredOrders.length,
      totalPages: Math.ceil(filteredOrders.length / limit),
      hasNext: endIndex < filteredOrders.length,
      hasPrev: page > 1
    }
  }
}

async function getMyOrdersAPI(options = {}) {
  const response = await get('/meus-pedidos')

  // FIX: apply mapStatus BEFORE filtering so the 'PENDENTE' filter
  // correctly matches raw 'CRIADO' orders returned by the backend.
  // Previously the filter ran on raw status values, so filtering by
  // 'PENDENTE' always returned 0 results (backend sends 'CRIADO').
  const mappedOrders = response.map(order => ({
    id: order.id,
    dataCriacao: order.dataCriacao,
    status: mapStatus(order.status),
    itens: [],
    endereco: order.enderecoEntrega ? {
      rua: order.enderecoEntrega,
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    } : null,
    pagamento: {
      metodo: 'PIX',
      status: order.dataPagamento ? 'PAGO' : 'PENDENTE'
    },
    valores: {
      subtotal: order.subtotal || 0,
      desconto: order.valorDesconto || 0,
      frete: order.valorFrete || 0,
      total: order.valorTotal || 0
    },
    quantidadeItens: order.quantidadeItens || 0,
    usuario: {
      id: '1',
      nome: 'Usuário Logado',
      email: 'usuario@exemplo.com'
    }
  }))

  // Filter AFTER mapping so PENDENTE matches CRIADO→PENDENTE conversions
  let filteredOrders = mappedOrders
  if (options.status) {
    filteredOrders = mappedOrders.filter(order => order.status === options.status)
  }

  const page = options.page || 1
  const limit = options.limit || 10
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  return {
    orders: paginatedOrders,
    pagination: {
      page, limit,
      total: filteredOrders.length,
      totalPages: Math.ceil(filteredOrders.length / limit),
      hasNext: endIndex < filteredOrders.length,
      hasPrev: page > 1
    }
  }
}

export const getOrderDetails = async (orderId) => {
  try {
    logger.info({ orderId }, 'Buscando detalhes do pedido')
    if (USE_MOCK) return await getOrderDetailsMock(orderId)
    return await getOrderDetailsAPI(orderId)
  } catch (error) {
    logger.error({ error, orderId }, 'Erro ao buscar detalhes do pedido')
    throw error
  }
}

async function getOrderDetailsMock(orderId) {
  const stored = localStorage.getItem('mockOrders')
  if (stored) mockUserOrders = JSON.parse(stored)
  const order = mockUserOrders.find(o => o.id === orderId)
  if (!order) throw new Error('Pedido não encontrado')
  return {
    ...order,
    rastreamento: generateTrackingInfo(order.status),
    historico: generateOrderHistory(order),
    estimativaEntrega: calculateDeliveryEstimate(order)
  }
}

async function getOrderDetailsAPI(orderId) {
  const response = await get(`/pedidos/${orderId}`)
  return {
    id: response.id,
    dataCriacao: response.dataCriacao,
    status: mapStatus(response.status),
    itens: response.itens ? response.itens.map(item => ({
      id: item.id,
      produto: {
        id: item.produtoId,
        nome: item.produtoNome,
        imagem: 'https://placehold.co/600x400/e5e7eb/9ca3af?text=Sem+imagem'
      },
      quantidade: item.quantidade,
      precoUnitario: item.precoUnitario,
      precoOriginal: item.precoUnitario,
      subtotal: item.subtotal
    })) : [],
    endereco: response.enderecoEntrega ? {
      rua: response.enderecoEntrega,
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: ''
    } : null,
    pagamento: {
      metodo: 'PIX',
      status: response.dataPagamento ? 'PAGO' : 'PENDENTE'
    },
    valores: {
      subtotal: response.subtotal || 0,
      desconto: response.valorDesconto || 0,
      frete: response.valorFrete || 0,
      total: response.valorTotal || 0
    },
    quantidadeItens: response.quantidadeItens || 0,
    usuario: { id: '1', nome: 'Usuário Logado', email: 'usuario@exemplo.com' },
    rastreamento: generateTrackingInfo(response.status),
    historico: generateOrderHistory(response),
    estimativaEntrega: calculateDeliveryEstimate(response)
  }
}

export const cancelOrder = async (orderId, motivo = '') => {
  try {
    logger.info({ orderId, motivo }, 'Cancelando pedido')
    if (USE_MOCK) return await cancelOrderMock(orderId, motivo)
    return await cancelOrderAPI(orderId, motivo)
  } catch (error) {
    logger.error({ error, orderId }, 'Erro ao cancelar pedido')
    throw error
  }
}

async function cancelOrderMock(orderId, motivo) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const stored = localStorage.getItem('mockOrders')
  if (stored) mockUserOrders = JSON.parse(stored)
  const orderIndex = mockUserOrders.findIndex(o => o.id === orderId)
  if (orderIndex === -1) throw new Error('Pedido não encontrado')
  const order = mockUserOrders[orderIndex]
  if (order.status === 'ENVIADO' || order.status === 'ENTREGUE') {
    throw new Error('Este pedido não pode mais ser cancelado')
  }
  mockUserOrders[orderIndex] = {
    ...order,
    status: 'CANCELADO',
    dataCancelamento: new Date().toISOString(),
    motivoCancelamento: motivo
  }
  localStorage.setItem('mockOrders', JSON.stringify(mockUserOrders))
  return mockUserOrders[orderIndex]
}

async function cancelOrderAPI(orderId, motivo) {
  const response = await post(`/pedidos/${orderId}/cancelar`, { motivo: motivo || 'Cancelado pelo cliente' })
  return {
    id: response.id,
    dataCriacao: response.dataCriacao,
    status: mapStatus(response.status),
    itens: [],
    endereco: response.enderecoEntrega ? { rua: response.enderecoEntrega, numero: '', bairro: '', cidade: '', estado: '', cep: '' } : null,
    pagamento: { metodo: 'PIX', status: response.dataPagamento ? 'PAGO' : 'PENDENTE' },
    valores: { subtotal: response.subtotal || 0, desconto: response.valorDesconto || 0, frete: response.valorFrete || 0, total: response.valorTotal || 0 },
    quantidadeItens: response.quantidadeItens || 0,
    usuario: { id: '1', nome: 'Usuário Logado', email: 'usuario@exemplo.com' },
    dataCancelamento: new Date().toISOString(),
    motivoCancelamento: motivo
  }
}

function generateMockOrders() {
  const statuses = ['PENDENTE', 'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO']
  const produtos = [
    { id: '1', nome: 'Notebook Gamer Pro', imagem: 'https://via.placeholder.com/100' },
    { id: '2', nome: 'Mouse Wireless RGB', imagem: 'https://via.placeholder.com/100' },
    { id: '3', nome: 'Teclado Mecânico', imagem: 'https://via.placeholder.com/100' },
    { id: '4', nome: 'Monitor 4K', imagem: 'https://via.placeholder.com/100' },
    { id: '5', nome: 'Headset Bluetooth', imagem: 'https://via.placeholder.com/100' }
  ]
  const orders = []
  for (let i = 1; i <= 5; i++) {
    const numItens = Math.floor(Math.random() * 3) + 1
    const itens = []
    for (let j = 0; j < numItens; j++) {
      const produto = produtos[Math.floor(Math.random() * produtos.length)]
      const quantidade = Math.floor(Math.random() * 2) + 1
      const preco = Math.floor(Math.random() * 500) + 100
      const precoOriginal = preco + Math.floor(Math.random() * 200)
      itens.push({ id: produto.id, produto, quantidade, precoUnitario: preco, precoOriginal, subtotal: preco * quantidade })
    }
    const subtotal = itens.reduce((total, item) => total + item.subtotal, 0)
    const desconto = Math.floor(Math.random() * 100)
    const frete = subtotal >= 200 ? 0 : 15
    const total = subtotal - desconto + frete
    const diasAtras = Math.floor(Math.random() * 30)
    const dataCriacao = new Date()
    dataCriacao.setDate(dataCriacao.getDate() - diasAtras)
    orders.push({
      id: `PED${String(i).padStart(6, '0')}`,
      dataCriacao: dataCriacao.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      itens,
      endereco: { rua: 'Rua das Flores', numero: '123', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01234-567' },
      pagamento: { metodo: 'PIX', status: 'PAGO' },
      valores: { subtotal, desconto, frete, total },
      usuario: { id: '1', nome: 'Usuário Teste', email: 'teste@exemplo.com' }
    })
  }
  return orders
}

function generateTrackingInfo(status) {
  if (status === 'PENDENTE' || status === 'CANCELADO') return null
  const codigos = { 'PAGO': 'AGUARDANDO_ENVIO', 'ENVIADO': 'BR123456789BR', 'ENTREGUE': 'BR123456789BR' }
  return {
    codigo: codigos[status] || null,
    status: status === 'ENTREGUE' ? 'Entregue' : 'Em trânsito',
    ultimaAtualizacao: new Date().toISOString()
  }
}

function generateOrderHistory(order) {
  const history = [{ data: order.dataCriacao, status: 'PENDENTE', descricao: 'Pedido criado e aguardando pagamento' }]
  if (['PAGO', 'ENVIADO', 'ENTREGUE'].includes(order.status)) {
    history.push({ data: new Date(order.dataCriacao).getTime() + 3600000, status: 'PAGO', descricao: 'Pagamento confirmado' })
  }
  if (['ENVIADO', 'ENTREGUE'].includes(order.status)) {
    history.push({ data: new Date(order.dataCriacao).getTime() + 7200000, status: 'ENVIADO', descricao: 'Pedido enviado para transportadora' })
  }
  if (order.status === 'ENTREGUE') {
    history.push({ data: new Date(order.dataCriacao).getTime() + 86400000, status: 'ENTREGUE', descricao: 'Pedido entregue com sucesso' })
  }
  if (order.status === 'CANCELADO') {
    history.push({ data: new Date(order.dataCriacao).getTime() + 3600000, status: 'CANCELADO', descricao: order.motivoCancelamento || 'Pedido cancelado pelo usuário' })
  }
  return history
}

function calculateDeliveryEstimate(order) {
  if (order.status === 'ENTREGUE' || order.status === 'CANCELADO') return null
  const dataCriacao = new Date(order.dataCriacao)
  let dataEstimada = new Date(dataCriacao)
  let diasAdicionados = 0
  while (diasAdicionados < 7) {
    dataEstimada.setDate(dataEstimada.getDate() + 1)
    if (dataEstimada.getDay() !== 0 && dataEstimada.getDay() !== 6) diasAdicionados++
  }
  return dataEstimada.toISOString()
}

export const finalizeCheckout = async (checkoutData) => {
  try {
    logger.info({ checkoutData }, 'Finalizando checkout')
    if (USE_MOCK) return await finalizeCheckoutMock(checkoutData)
    return await finalizeCheckoutAPI(checkoutData)
  } catch (error) {
    logger.error({ error, checkoutData }, 'Erro ao finalizar checkout')
    throw error
  }
}

async function finalizeCheckoutAPI(checkoutData) {
  const response = await post('/checkout/finalizar', checkoutData)
  return {
    id: response.id,
    dataCriacao: response.dataCriacao,
    status: mapStatus(response.status),
    itens: [],
    endereco: response.enderecoEntrega ? { rua: response.enderecoEntrega, numero: '', bairro: '', cidade: '', estado: '', cep: '' } : null,
    pagamento: { metodo: 'PIX', status: 'PENDENTE' },
    valores: { subtotal: response.subtotal || 0, desconto: response.valorDesconto || 0, frete: response.valorFrete || 0, total: response.valorTotal || 0 },
    quantidadeItens: response.quantidadeItens || 0,
    usuario: { id: '1', nome: 'Usuário Logado', email: 'usuario@exemplo.com' },
    observacoes: response.observacoes
  }
}

async function finalizeCheckoutMock(checkoutData) {
  await new Promise(resolve => setTimeout(resolve, 1500))
  const mockOrder = {
    id: `PED${Date.now()}`,
    dataCriacao: new Date().toISOString(),
    status: 'CRIADO',
    itens: [],
    endereco: { rua: checkoutData.enderecoEntrega || 'Rua das Flores', numero: '123', bairro: 'Centro', cidade: 'São Paulo', estado: 'SP', cep: '01234-567' },
    pagamento: { metodo: 'PIX', status: 'PENDENTE' },
    valores: { subtotal: 1000, desconto: 0, frete: 0, total: 1000 },
    quantidadeItens: 1,
    usuario: { id: '1', nome: 'Usuário Teste', email: 'teste@exemplo.com' },
    observacoes: checkoutData.observacoes
  }
  const stored = localStorage.getItem('mockOrders')
  let orders = stored ? JSON.parse(stored) : []
  orders.push(mockOrder)
  localStorage.setItem('mockOrders', JSON.stringify(orders))
  return mockOrder
}

export const payOrder = async (orderId) => {
  try {
    logger.info({ orderId }, 'Simulando pagamento do pedido')
    if (USE_MOCK) return await payOrderMock(orderId)
    return await payOrderAPI(orderId)
  } catch (error) {
    logger.error({ error, orderId }, 'Erro ao simular pagamento')
    throw error
  }
}

async function payOrderAPI(orderId) {
  const response = await post(`/pedidos/${orderId}/pagar`)
  return response
}

async function payOrderMock(orderId) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  const stored = localStorage.getItem('mockOrders')
  if (!stored) throw new Error('Pedido não encontrado')
  let orders = JSON.parse(stored)
  const orderIndex = orders.findIndex(o => o.id === orderId)
  if (orderIndex === -1) throw new Error('Pedido não encontrado')
  const order = orders[orderIndex]
  if (order.status !== 'CRIADO') throw new Error('Este pedido não pode ser pago')
  orders[orderIndex] = {
    ...order,
    status: 'PAGO',
    dataPagamento: new Date().toISOString(),
    pagamento: { ...order.pagamento, status: 'PAGO' }
  }
  localStorage.setItem('mockOrders', JSON.stringify(orders))
  return orders[orderIndex]
}

export const clearOrderMockData = () => {
  mockUserOrders = []
  localStorage.removeItem('mockOrders')
  localStorage.removeItem('lastOrder')
}
