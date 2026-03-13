/**
 * adminService.js
 * All admin API calls — verified against NestJS source (all endpoints, DTOs, and HTTP methods).
 * Uses the existing api.js axios instance which injects the Bearer token from localStorage.
 */
import api from './api'

const adminService = {
  // ─── Pedidos ──────────────────────────────────────────────────────────────

  async getPedidos() {
    const res = await api.get('/admin/pedidos')
    return res.data
  },

  async getPedidosByStatus(status) {
    const res = await api.get(`/admin/pedidos/status/${status}`)
    return res.data
  },

  async getPedido(id) {
    const res = await api.get(`/admin/pedidos/${id}`)
    return res.data
  },

  /** @param {{ metodoPagamento: 'CARTAO'|'PIX'|'BOLETO', valorPago?: number }} dto */
  async pagarPedido(id, dto) {
    const res = await api.post(`/admin/pedidos/${id}/pagar`, dto)
    return res.data
  },

  /** @param {{ codigoRastreio: string, transportadora: string }} dto */
  async enviarPedido(id, dto) {
    const res = await api.post(`/admin/pedidos/${id}/enviar`, dto)
    return res.data
  },

  async entregarPedido(id) {
    const res = await api.post(`/admin/pedidos/${id}/entregar`, {})
    return res.data
  },

  /** @param {{ motivo: string }} dto */
  async cancelarPedido(id, dto) {
    const res = await api.post(`/admin/pedidos/${id}/cancelar`, dto)
    return res.data
  },

  // ─── Produtos ─────────────────────────────────────────────────────────────
  // NOTE: Do NOT pass page/size — backend returns flat ProdutoDto[] without them.
  // Available filters: nome, termo, categoriaId, precoMin, precoMax, ativo, sort

  async getProdutos(params = {}) {
    const res = await api.get('/produtos', { params })
    return res.data
  },

  async getProduto(id) {
    const res = await api.get(`/produtos/${id}`)
    return res.data
  },

  async criarProduto(dto) {
    const res = await api.post('/produtos', dto)
    return res.data
  },

  async atualizarProduto(id, dto) {
    const res = await api.put(`/produtos/${id}`, dto)
    return res.data
  },

  async excluirProduto(id) {
    await api.delete(`/produtos/${id}`)
  },

  // ─── Estoque ──────────────────────────────────────────────────────────────
  // NOTE: URL pattern is /estoque/produto/:produtoId — NOT /estoque/:produtoId
  // NOTE: ajustar uses PUT, not POST

  async getEstoque(produtoId) {
    const res = await api.get(`/estoque/produto/${produtoId}`)
    return res.data
  },

  async adicionarEstoque(produtoId, quantidade) {
    const res = await api.post(`/estoque/produto/${produtoId}/adicionar`, { quantidade })
    return res.data
  },

  async removerEstoque(produtoId, quantidade) {
    const res = await api.post(`/estoque/produto/${produtoId}/remover`, { quantidade })
    return res.data
  },

  async ajustarEstoque(produtoId, quantidade) {
    const res = await api.put(`/estoque/produto/${produtoId}/ajustar`, { quantidade })
    return res.data
  },

  // ─── Categorias ───────────────────────────────────────────────────────────

  async getCategorias() {
    const res = await api.get('/categorias')
    return res.data
  },

  /** @param {{ nome: string, descricao: string, ativo?: boolean }} dto */
  async criarCategoria(dto) {
    const res = await api.post('/categorias', dto)
    return res.data
  },

  /** @param {{ nome: string, descricao: string, ativo?: boolean }} dto */
  async atualizarCategoria(id, dto) {
    const res = await api.put(`/categorias/${id}`, dto)
    return res.data
  },

  async excluirCategoria(id) {
    await api.delete(`/categorias/${id}`)
  },

  // ─── DLQ ──────────────────────────────────────────────────────────────────

  async getDlqQueues() {
    const res = await api.get('/admin/dlq/queues')
    return res.data
  },

  async requeueDlq(queue) {
    const res = await api.post(`/admin/dlq/requeue/${queue}`)
    return res.data
  },

  async requeueAllDlq() {
    const res = await api.post('/admin/dlq/requeue-all')
    return res.data
  },

  // ─── Dashboard ────────────────────────────────────────────────────────────
  // NOTE: This endpoint does NOT exist yet on the backend.
  // The AdminDashboard page must handle the 404 gracefully.

  async getDashboard() {
    const res = await api.get('/admin/dashboard')
    return res.data
  },
}

export default adminService
