import { useState, useEffect } from 'react'
import type { Order, PaginationInfo } from '../types'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import OrderCard from '../components/common/OrderCard'
import Button from '../components/common/Button'
import Loading from '../components/common/Loading'
import EmptyState from '../components/common/EmptyState'
import { getMyOrders, cancelOrder } from '../services/orderService'
import logger from '../utils/logger'
import { 
  FiShoppingBag, 
  FiFilter, 
  FiRefreshCw,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi'

/**
 * Orders Page
 * 
 * Página de listagem de pedidos do usuário
 * Com filtros, cards de pedido e estados de loading/empty
 */
export default function Orders() {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Estados da página
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Estados de UI
  const [cancellingOrderId, setCancellingOrderId] = useState<string | number | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Verificar se usuário está logado
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/pedidos')
    }
  }, [user, navigate])

  // Carregar pedidos
  const loadOrders = async (page = 1, statusFilter: string | null = null) => {
    try {
      setError('')
      
      const options: Record<string, unknown> = {
        page,
        limit: 10
      }
      
      if (statusFilter && statusFilter !== 'all') {
        options.status = statusFilter
      }

      const response = await getMyOrders(options)
      
      setOrders(response.orders || [])
      setPagination(response.pagination || null)
      setCurrentPage(page)

    } catch (err) {
      logger.error({ error: (err as Error).message }, 'Erro ao carregar pedidos')
      setError((err as Error).message || 'Não foi possível carregar seus pedidos. Tente novamente.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Carregar pedidos iniciais
  useEffect(() => {
    if (user) {
      loadOrders()
    }
  }, [user])

  // Lidar com mudança de filtro
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    setLoading(true)
    loadOrders(1, newFilter === 'all' ? null : newFilter)
  }

  // Recarregar pedidos
  const handleRefresh = () => {
    setRefreshing(true)
    loadOrders(currentPage, filter === 'all' ? null : filter)
  }

  // Carregar mais pedidos (paginação)
  const handleLoadMore = () => {
    if (pagination && pagination.hasNext) {
      setLoading(true)
      loadOrders(currentPage + 1, filter === 'all' ? null : filter)
    }
  }

  // Cancelar pedido
  const handleCancelOrder = async (orderId: string | number) => {
    if (!window.confirm('Tem certeza que deseja cancelar este pedido?')) {
      return
    }

    setCancellingOrderId(orderId)
    
    try {
      await cancelOrder(orderId)
      
      // Atualizar lista de pedidos
      await handleRefresh()
      
    } catch (err) {
      logger.error({ error: (err as Error).message, orderId }, 'Erro ao cancelar pedido')
      setError((err as Error).message || 'Não foi possível cancelar o pedido. Tente novamente.')
    } finally {
      setCancellingOrderId(null)
    }
  }

  // Opções de filtro
  const filterOptions = [
    { value: 'all', label: 'Todos', icon: FiPackage },
    { value: 'PENDENTE', label: 'Pendentes', icon: FiClock },
    { value: 'PAGO', label: 'Pagos', icon: FiCheckCircle },
    { value: 'ENVIADO', label: 'Enviados', icon: FiPackage },
    { value: 'ENTREGUE', label: 'Entregues', icon: FiCheckCircle },
    { value: 'CANCELADO', label: 'Cancelados', icon: FiXCircle }
  ]

  // Contar pedidos por status
  const getStatusCount = (status: string) => {
    if (status === 'all') return orders.length
    return orders.filter(order => order.status === status).length
  }

  // Loading inicial
  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loading />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                Meus Pedidos
              </h1>
              <p className="font-sans text-muted-foreground">
                Acompanhe o status e detalhes dos seus pedidos
              </p>
            </div>
            
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={refreshing}
              className="shrink-0"
            >
              <FiRefreshCw className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-900 mb-1">
                  Erro ao carregar pedidos
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FiFilter className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-sans font-medium text-foreground">Filtrar por:</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => {
              const Icon = option.icon
              const count = getStatusCount(option.value)
              const isActive = filter === option.value
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={`
                    inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2
                    font-medium text-sm transition-[background-color,color]
                    ${isActive 
                      ? 'border-foreground bg-foreground text-background' 
                      : 'border-border bg-card text-foreground hover:border-foreground/30 hover:bg-muted'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs tabular-nums
                    ${isActive 
                      ? 'bg-background/20 text-background' 
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Lista de Pedidos */}
        {orders.length === 0 ? (
          <EmptyState
            icon={<FiShoppingBag size={64} />}
            title="Nenhum pedido encontrado"
            description={
              filter === 'all' 
                ? 'Você ainda não fez nenhum pedido. Que tal fazer uma compra?'
                : `Você não tem pedidos ${filter.toLowerCase()} no momento.`
            }
            action={
              filter === 'all' && (
                <Link to="/produtos">
                  <Button>
                    <FiShoppingBag className="mr-2" />
                    Ver Produtos
                  </Button>
                </Link>
              )
            }
          />
        ) : (
          <div className="space-y-4">
            {/* Cards de Pedidos */}
            {orders.map((order) => (
              <OrderCard 
                key={order.id}
                order={order}
                showCancelButton={order.status === 'PENDENTE'}
                onCancel={() => handleCancelOrder(order.id)}
                cancelling={cancellingOrderId === order.id}
              />
            ))}

            {/* Paginação / Carregar Mais */}
            {pagination && pagination.hasNext && (
              <div className="text-center pt-6">
                <Button
                  onClick={handleLoadMore}
                  variant="outline"
                  disabled={loading}
                  loading={loading}
                >
                  Carregar Mais Pedidos
                </Button>
              </div>
            )}

            {/* Informações da Paginação */}
            {pagination && (
              <div className="text-center text-sm text-muted-foreground font-sans pt-4 border-t border-border">
                Mostrando {orders.length} de {pagination.total} pedidos
                {pagination.totalPages > 1 && (
                  <span> • Página {pagination.page} de {pagination.totalPages}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Resumo Rápido (Mobile) */}
        {orders.length > 0 && (
          <div className="mt-8 lg:hidden bg-card rounded-lg shadow-sm border border-border p-4">
            <h3 className="font-display font-semibold text-foreground mb-3">Resumo Rápido</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-foreground tabular-nums">
                  {orders.filter(o => o.status === 'ENTREGUE').length}
                </div>
                <div className="text-xs font-sans text-muted-foreground">Entregues</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-foreground tabular-nums">
                  {orders.filter(o => ['PENDENTE', 'PAGO', 'ENVIADO'].includes(o.status)).length}
                </div>
                <div className="text-xs font-sans text-muted-foreground">Em Andamento</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}