import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import { 
  FiArrowLeft, 
  FiPackage, 
  FiTruck, 
  FiClock,
  FiCheckCircle,
  FiMapPin,
  FiCreditCard,
  FiBox
} from 'react-icons/fi'
import { getOrderDetails, payOrder } from '../services/orderService'

/**
 * OrderDetail Page
 * 
 * Página de detalhes de um pedido específico
 * Exibe informações completas do pedido e permite ações
 */
export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)

  // Verificar se usuário está logado
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/pedido/' + id)
    }
  }, [user, navigate, id])

  // Carregar detalhes do pedido
  const loadOrderDetails = async () => {
    try {
      setError('')
      const orderData = await getOrderDetails(id)
      setOrder(orderData)
    } catch (err) {
      logger.error('Erro ao carregar detalhes do pedido', { error: err.message, orderId: id })
      setError(err.message || 'Não foi possível carregar os detalhes do pedido.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && id) {
      loadOrderDetails()
    }
  }, [user, id])

  // Pagar pedido
  const handlePayOrder = async () => {
    if (!window.confirm('Deseja simular o pagamento deste pedido?')) {
      return
    }

    setPaying(true)
    try {
      await payOrder(id)
      await loadOrderDetails() // Recarregar dados
    } catch (err) {
      logger.error('Erro ao pagar pedido', { error: err.message, orderId: id })
      setError(err.message || 'Não foi possível processar o pagamento.')
    } finally {
      setPaying(false)
    }
  }

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get status variant
  const getStatusVariant = (status) => {
    const variants = {
      PENDENTE: 'warning',
      PAGO: 'info',
      ENVIADO: 'info',
      ENTREGUE: 'success',
      CANCELADO: 'danger',
    }
    return variants[status] || 'secondary'
  }

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      PENDENTE: 'Pendente',
      PAGO: 'Pago',
      ENVIADO: 'Enviado',
      ENTREGUE: 'Entregue',
      CANCELADO: 'Cancelado',
    }
    return labels[status] || status
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loading size="lg" text="Carregando detalhes do pedido..." />
          </div>
        </div>
      </div>
    )
  }

  // Error
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Pedido Não Encontrado
            </h1>
            <p className="text-gray-600 mb-8">
              {error || 'O pedido que você procura não existe ou não está disponível.'}
            </p>
            <Link to="/pedidos">
              <Button>
                <FiArrowLeft className="mr-2" />
                Voltar para Meus Pedidos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/pedidos">
              <Button variant="ghost" size="sm">
                <FiArrowLeft className="mr-2" />
                Voltar para Meus Pedidos
              </Button>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3 mb-4 md:mb-0">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <FiPackage className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Pedido #{order.id}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.dataCriacao)}
                  </p>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <span className={`text-sm font-medium capitalize ${
                  order.status === 'ENTREGUE' ? 'text-green-700' :
                  order.status === 'CANCELADO' ? 'text-red-700' :
                  order.status === 'ENVIADO' ? 'text-blue-700' :
                  'text-amber-700'
                }`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Esquerda - Informações */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Itens do Pedido */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Itens do Pedido</h2>
              <div className="space-y-4">
                {order.itens?.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                    <img
                      src={item.produto?.imagem || 'https://via.placeholder.com/80'}
                      alt={item.produto?.nome}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.produto?.nome || item.nome}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quantidade: {item.quantidade}
                      </p>
                      <p className="text-sm font-medium text-primary-600">
                        R$ {item.precoUnitario?.toFixed(2) || '0,00'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        R$ {(item.precoUnitario * item.quantidade)?.toFixed(2) || '0,00'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Endereço de Entrega */}
            {order.endereco && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  <FiMapPin className="inline mr-2" />
                  Endereço de Entrega
                </h2>
                <div className="text-gray-700">
                  {typeof order.endereco === 'string' ? (
                    <p>{order.endereco}</p>
                  ) : (
                    <div>
                      <p>{order.endereco.rua}, {order.endereco.numero}</p>
                      {order.endereco.complemento && <p>{order.endereco.complemento}</p>}
                      <p>{order.endereco.bairro} - {order.endereco.cidade}/{order.endereco.estado}</p>
                      <p>CEP: {order.endereco.cep}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Histórico do Pedido */}
            {order.historico && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Histórico</h2>
                <div className="space-y-4">
                  {order.historico.map((item, index) => (
                    <div key={index} className="flex gap-3 pb-4 border-b border-gray-200 last:border-0">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                        ${item.status === 'ENTREGUE' ? 'bg-green-100 text-green-700' :
                          item.status === 'CANCELADO' ? 'bg-red-100 text-red-700' :
                          item.status === 'ENVIADO' ? 'bg-blue-100 text-blue-700' :
                          item.status === 'PAGO' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }
                      `}>
                        {item.status === 'ENTREGUE' ? <FiCheckCircle /> :
                         item.status === 'CANCELADO' ? null :
                         item.status === 'ENVIADO' ? <FiTruck /> :
                         item.status === 'PAGO' ? <FiCheckCircle /> :
                         <FiClock />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.descricao}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(item.data)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coluna Direita - Resumo e Ações */}
          <div className="space-y-6">
            
            {/* Resumo Financeiro */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {order.valores?.subtotal?.toFixed(2) || '0,00'}</span>
                </div>
                {order.valores?.desconto > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto</span>
                    <span>-R$ {order.valores.desconto.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Frete</span>
                  <span>R$ {order.valores?.frete?.toFixed(2) || '0,00'}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary-600">
                      R$ {order.valores?.total?.toFixed(2) || '0,00'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações de Pagamento */}
            {order.pagamento && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  <FiCreditCard className="inline mr-2" />
                  Pagamento
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Método</span>
                    <span className="font-medium capitalize">
                      {order.pagamento.metodo?.replace('_', ' ') || 'Pix'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className={`font-medium ${
                      order.pagamento.status === 'PAGO' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {order.pagamento.status === 'PAGO' ? 'Pago' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="space-y-3">
              {order.status === 'PENDENTE' && (
                <Button
                  onClick={handlePayOrder}
                  loading={paying}
                  disabled={paying}
                  className="w-full"
                >
                  <FiCreditCard className="mr-2" />
                  {paying ? 'Processando...' : 'Pagar Agora'}
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => navigate('/produtos')}
                className="w-full"
              >
                <FiBox className="mr-2" />
                Continuar Comprando
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}