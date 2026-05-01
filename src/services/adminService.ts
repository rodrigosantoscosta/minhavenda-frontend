/**
 * adminService.ts
 * All admin API calls — verified against NestJS source (all endpoints, DTOs, and HTTP methods).
 * Uses the existing api.ts axios instance which injects the Bearer token from localStorage.
 */
import api from './api'
import type { Product, Category, CreateProductRequest, UpdateProductRequest, CreateCategoryRequest, Order, Stock, DLQMessage } from '../types'

interface PagarPedidoDto {
  metodoPagamento: 'CARTAO' | 'PIX' | 'BOLETO'
  valorPago?: number
}

interface EnviarPedidoDto {
  codigoRastreio: string
  transportadora: string
}

interface CancelarPedidoDto {
  motivo: string
}

export interface DashboardData {
  totalVendas: number
  totalPedidos: number
  totalClientes: number
  totalProdutos: number
  faturamentoMes: number
  ticketMedio: number
  pedidosRecentes: Order[]
  produtosMaisVendidos: Product[]
  receitaTotal: number
  pedidosPorStatus: Record<string, number>
  estoqueBaixo: { produtoId: string | number; nome: string; quantidade: number }[]
}

export interface DREReport {
  periodo: string
  receitaBruta: number
  deducoes: number
  receitaLiquida: number
  custoMercadorias: number
  lucroBruto: number
  despesasOperacionais: number
  lucroLiquido: number
}

export interface DespesaReport {
  id: string | number
  data: string
  descricao: string
  valor: number
  categoria: string
}

interface AdminService {
  getPedidos(): Promise<Order[]>
  getPedidosByStatus(status: string): Promise<Order[]>
  getPedido(id: string | number): Promise<Order>
  pagarPedido(id: string | number, dto: PagarPedidoDto): Promise<Order>
  enviarPedido(id: string | number, dto: EnviarPedidoDto): Promise<Order>
  entregarPedido(id: string | number): Promise<Order>
  cancelarPedido(id: string | number, dto: CancelarPedidoDto): Promise<Order>
  getProdutos(params?: Record<string, unknown>): Promise<Product[]>
  getProduto(id: string | number): Promise<Product>
  criarProduto(dto: CreateProductRequest): Promise<Product>
  atualizarProduto(id: string | number, dto: UpdateProductRequest): Promise<Product>
  excluirProduto(id: string | number): Promise<void>
  getEstoque(produtoId: string | number): Promise<Stock>
  adicionarEstoque(produtoId: string | number, quantidade: number): Promise<Stock>
  removerEstoque(produtoId: string | number, quantidade: number): Promise<Stock>
  ajustarEstoque(produtoId: string | number, quantidade: number): Promise<Stock>
  getCategorias(): Promise<Category[]>
  criarCategoria(dto: CreateCategoryRequest): Promise<Category>
  atualizarCategoria(id: string | number, dto: CreateCategoryRequest): Promise<Category>
  excluirCategoria(id: string | number): Promise<void>
  getDlqQueues(): Promise<string[]>
  requeueDlq(queue: string): Promise<DLQMessage[]>
  requeueAllDlq(): Promise<DLQMessage[]>
  getDRE(inicio: string, fim: string): Promise<DREReport>
  getDespesas(inicio: string, fim: string): Promise<DespesaReport[]>
  getDashboard(): Promise<DashboardData>
}

const adminService: AdminService = {
  // ─── Pedidos ──────────────────────────────────────────────────────────────

  async getPedidos(): Promise<Order[]> {
    const res = await api.get<Order[]>('/admin/pedidos')
    return res.data
  },

  async getPedidosByStatus(status: string): Promise<Order[]> {
    const res = await api.get<Order[]>(`/admin/pedidos/status/${status}`)
    return res.data
  },

  async getPedido(id: string | number): Promise<Order> {
    const res = await api.get<Order>(`/admin/pedidos/${id}`)
    return res.data
  },

  async pagarPedido(id: string | number, dto: PagarPedidoDto): Promise<Order> {
    const res = await api.post<Order>(`/admin/pedidos/${id}/pagar`, dto)
    return res.data
  },

  async enviarPedido(id: string | number, dto: EnviarPedidoDto): Promise<Order> {
    const res = await api.post<Order>(`/admin/pedidos/${id}/enviar`, dto)
    return res.data
  },

  async entregarPedido(id: string | number): Promise<Order> {
    const res = await api.post<Order>(`/admin/pedidos/${id}/entregar`, {})
    return res.data
  },

  async cancelarPedido(id: string | number, dto: CancelarPedidoDto): Promise<Order> {
    const res = await api.post<Order>(`/admin/pedidos/${id}/cancelar`, dto)
    return res.data
  },

  // ─── Produtos ─────────────────────────────────────────────────────────────
  // NOTE: Do NOT pass page/size — backend returns flat ProdutoDto[] without them.
  // Available filters: nome, termo, categoriaId, precoMin, precoMax, ativo, sort

  async getProdutos(params: Record<string, unknown> = {}): Promise<Product[]> {
    const res = await api.get<Product[]>('/produtos', { params })
    return res.data
  },

  async getProduto(id: string | number): Promise<Product> {
    const res = await api.get<Product>(`/produtos/${id}`)
    return res.data
  },

  async criarProduto(dto: CreateProductRequest): Promise<Product> {
    const res = await api.post<Product>('/produtos', dto)
    return res.data
  },

  async atualizarProduto(id: string | number, dto: UpdateProductRequest): Promise<Product> {
    const res = await api.put<Product>(`/produtos/${id}`, dto)
    return res.data
  },

  async excluirProduto(id: string | number): Promise<void> {
    await api.delete(`/produtos/${id}`)
  },

  // ─── Estoque ──────────────────────────────────────────────────────────────
  // NOTE: URL pattern is /estoque/produto/:produtoId — NOT /estoque/:produtoId
  // NOTE: ajustar uses PUT, not POST

  async getEstoque(produtoId: string | number): Promise<Stock> {
    const res = await api.get<Stock>(`/estoque/produto/${produtoId}`)
    return res.data
  },

  async adicionarEstoque(produtoId: string | number, quantidade: number): Promise<Stock> {
    const res = await api.post<Stock>(`/estoque/produto/${produtoId}/adicionar`, { quantidade })
    return res.data
  },

  async removerEstoque(produtoId: string | number, quantidade: number): Promise<Stock> {
    const res = await api.post<Stock>(`/estoque/produto/${produtoId}/remover`, { quantidade })
    return res.data
  },

  async ajustarEstoque(produtoId: string | number, quantidade: number): Promise<Stock> {
    const res = await api.put<Stock>(`/estoque/produto/${produtoId}/ajustar`, { quantidade })
    return res.data
  },

  // ─── Categorias ───────────────────────────────────────────────────────────

  async getCategorias(): Promise<Category[]> {
    const res = await api.get<Category[]>('/categorias')
    return res.data
  },

  async criarCategoria(dto: CreateCategoryRequest): Promise<Category> {
    const res = await api.post<Category>('/categorias', dto)
    return res.data
  },

  async atualizarCategoria(id: string | number, dto: CreateCategoryRequest): Promise<Category> {
    const res = await api.put<Category>(`/categorias/${id}`, dto)
    return res.data
  },

  async excluirCategoria(id: string | number): Promise<void> {
    await api.delete(`/categorias/${id}`)
  },

  // ─── DLQ ──────────────────────────────────────────────────────────────────

  async getDlqQueues(): Promise<string[]> {
    const res = await api.get<string[]>('/admin/dlq/queues')
    return res.data
  },

  async requeueDlq(queue: string): Promise<DLQMessage[]> {
    const res = await api.post<DLQMessage[]>(`/admin/dlq/requeue/${queue}`)
    return res.data
  },

  async requeueAllDlq(): Promise<DLQMessage[]> {
    const res = await api.post<DLQMessage[]>('/admin/dlq/requeue-all')
    return res.data
  },

  // ─── Relatórios Financeiros ───────────────────────────────────────────────

  async getDRE(inicio: string, fim: string): Promise<DREReport> {
    const res = await api.get<DREReport>('/admin/relatorios/dre', { params: { inicio, fim } })
    return res.data
  },

  async getDespesas(inicio: string, fim: string): Promise<DespesaReport[]> {
    const res = await api.get<DespesaReport[]>('/admin/relatorios/despesas', { params: { inicio, fim } })
    return res.data
  },

  // ─── Dashboard ────────────────────────────────────────────────────────────
  // NOTE: This endpoint does NOT exist yet on the backend.
  // The AdminDashboard page must handle the 404 gracefully.

  async getDashboard(): Promise<DashboardData> {
    const res = await api.get<DashboardData>('/admin/dashboard')
    return res.data
  },
}

export default adminService
