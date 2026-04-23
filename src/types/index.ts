/**
 * Shared type definitions for the Minhavenda frontend
 * These types represent the core entities and data structures used across the application
 */

// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export type UserRole = 'ADMIN' | 'CLIENTE'

export interface User {
  id: string | number | null
  nome: string | null
  email: string | null
  role: UserRole | null
  tipo: UserRole | null
}

export interface LoginRequest {
  email: string
  senha: string
}

export interface RegisterRequest {
  nome: string
  email: string
  senha: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  email?: string
  nome?: string
  user?: User
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface GoogleExchangeRequest {
  code: string
}

export interface PasswordChangeRequest {
  senhaAtual: string
  novaSenha: string
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface Product {
  id: string | number
  nome: string
  descricao: string
  preco: number
  precoOriginal?: number
  urlImagem?: string
  categoriaId: string | number
  categoria?: Category
  estoque?: number
  ativo: boolean
  dataCriacao: string
  slug?: string
}

export interface CreateProductRequest {
  nome: string
  descricao: string
  preco: number
  categoriaId: string | number
  estoque?: number
  urlImagem?: string
}

export interface UpdateProductRequest {
  nome?: string
  descricao?: string
  preco?: number
  categoriaId?: string | number
  estoque?: number
  urlImagem?: string
  ativo?: boolean
}

export interface ProductFilter {
  categoriaId?: string | number
  search?: string
  minPrice?: number
  maxPrice?: number
  sort?: 'nome' | 'preco' | 'dataCriacao'
  order?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export interface Category {
  id: string | number
  nome: string
  descricao?: string
  urlImagem?: string
  ativo: boolean
  dataCriacao: string
  produtos?: Product[]
}

export interface CreateCategoryRequest {
  nome: string
  descricao?: string
  urlImagem?: string
}

export interface UpdateCategoryRequest {
  nome?: string
  descricao?: string
  urlImagem?: string
  ativo?: boolean
}

export interface CategoryFilter {
  search?: string
  ativo?: boolean
}

// ============================================================================
// CART TYPES
// ============================================================================

export interface CartItem {
  id?: string | number
  produtoId: string | number
  produto?: Product
  quantidade: number
  precoUnitario: number
  subtotal?: number
  estoque?: number | null
}

export interface Cart {
  id?: string | number
  itens: CartItem[]
  quantidadeItens: number
  valorTotal: number
  valorDesconto?: number
  usuarioId?: string | number
  dataCriacao?: string
  dataAtualizacao?: string
}

export interface AddCartItemRequest {
  produtoId: string | number
  quantidade: number
}

export interface UpdateCartItemRequest {
  quantidade: number
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export type OrderStatus = 'CRIADO' | 'PENDENTE' | 'PAGO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO'

export interface OrderItem {
  id: string | number
  produtoId: string | number
  produtoNome?: string
  produto?: Product
  quantidade: number
  precoUnitario: number
  subtotal: number
}

export interface OrderAddress {
  rua: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export interface OrderPayment {
  metodo: string
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'ESTORNADO'
}

export interface OrderValues {
  subtotal: number
  desconto: number
  frete: number
  total: number
}

export interface Order {
  id: string | number
  dataCriacao: string
  status: OrderStatus
  itens: OrderItem[]
  endereco?: OrderAddress | null
  enderecoEntrega?: string
  pagamento: OrderPayment
  valores: OrderValues
  quantidadeItens: number
  usuario?: User
  dataPagamento?: string
  dataCancelamento?: string
  motivoCancelamento?: string
  observacoes?: string
  valorDesconto?: number
  valorFrete?: number
  valorTotal?: number
  subtotal?: number
}

export interface CreateOrderRequest {
  enderecoEntrega?: string
  observacoes?: string
}

export interface CheckoutRequest {
  enderecoEntrega?: string
  observacoes?: string
  metodoPagamento?: string
}

export interface CancelOrderRequest {
  motivo: string
}

export interface OrderFilter {
  status?: OrderStatus
  page?: number
  limit?: number
}

export interface OrderPaginationResult {
  orders: Order[]
  pagination: PaginationInfo
}

// ============================================================================
// STOCK (ESTOQUE) TYPES
// ============================================================================

export interface Stock {
  id: string | number
  produtoId: string | number
  produto?: Product
  quantidade: number
  minimo?: number
  dataAtualizacao: string
}

export interface AddStockRequest {
  quantidade: number
}

export interface RemoveStockRequest {
  quantidade: number
  motivo: string
}

export interface AdjustStockRequest {
  quantidade: number
  motivo: string
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface Notification {
  id: string | number
  usuarioId: string | number
  titulo: string
  mensagem: string
  lido: boolean
  dataCriacao: string
  tipo?: 'info' | 'warning' | 'error' | 'success'
}

// ============================================================================
// FINANCIAL REPORT TYPES
// ============================================================================

export interface FinancialReport {
  id: string | number
  data: string
  tipo: string
  valor: number
  descricao?: string
  categoria?: string
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

// ============================================================================
// ADMIN DASHBOARD TYPES
// ============================================================================

export interface DashboardStats {
  totalVendas: number
  totalPedidos: number
  totalClientes: number
  totalProdutos: number
  faturamentoMes: number
  ticketMedio: number
  pedidosRecentes: Order[]
  produtosMaisVendidos: Product[]
}

export interface AdminUser {
  id: string | number
  nome: string
  email: string
  tipo: UserRole
  ativo: boolean
  dataCriacao: string
  ultimoAcesso?: string
}

// ============================================================================
// PAGINATION & COMMON TYPES
// ============================================================================

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationInfo
}

export interface PageRequest {
  page?: number
  pageSize?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface CursorPageRequest {
  cursor?: string
  limit?: number
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  statusCode: number
  error?: string
}

// ============================================================================
// DLQ (DEAD LETTER QUEUE) TYPES
// ============================================================================

export interface DLQMessage {
  id: string
  queue: string
  payload: unknown
  error: string
  dataCriacao: string
  tentativas: number
}

export interface DLQFilter {
  queue?: string
  page?: number
  limit?: number
}

// ============================================================================
// COMPONENT PROP TYPES (Common patterns)
// ============================================================================

export interface LoadingState {
  loading: boolean
  error?: string | null
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export interface InputProps {
  label?: string
  type?: string
  error?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}
