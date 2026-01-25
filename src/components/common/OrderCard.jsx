import { Link } from 'react-router-dom'
import { FiPackage, FiClock, FiTruck, FiCheck } from 'react-icons/fi'
import Badge from './Badge'
import Button from './Button'

/**
 * OrderCard Component
 * 
 * Card para exibir pedido
 */
export default function OrderCard({ order, showCancelButton = false, onCancel, cancelling = false }) {
  const {
    id,
    dataCriacao,
    status,
    total,
    valores,
    itens,
    endereco,
  } = order

  // Usar valores.total se total não estiver disponível
  const orderTotal = total || valores?.total || 0

  // Função auxiliar para extrair valor do preço (objeto ou número)
  const getPrecoValue = (preco) => {
    if (typeof preco === 'object' && preco !== null) {
      return preco.valor || 0
    }
    return preco || 0
  }

  // Função segura para formatar valores
  const formatarValor = (valor) => {
    const preco = getPrecoValue(valor)
    if (typeof preco !== 'number' || isNaN(preco)) {
      return 'R$ 0,00'
    }
    return `R$ ${preco.toFixed(2)}`
  }

  // Status icons
  const statusIcons = {
    PENDENTE: <FiClock className="w-5 h-5" />,
    PAGO: <FiCheck className="w-5 h-5" />,
    ENVIADO: <FiTruck className="w-5 h-5" />,
    ENTREGUE: <FiCheck className="w-5 h-5" />,
    CANCELADO: null,
  }

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
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

  return (
    <Link
      to={`/pedido/${id}`}
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 p-4 md:p-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3 mb-3 md:mb-0">
          <div className="p-3 bg-primary-50 rounded-lg">
            <FiPackage className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Pedido #{id}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(dataCriacao)}
            </p>
          </div>
        </div>

        <Badge 
          variant={getStatusVariant(status)}
          leftIcon={statusIcons[status]}
        >
          {getStatusLabel(status)}
        </Badge>
      </div>

      {/* Items Preview */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          {itens?.length || 0} {itens?.length === 1 ? 'item' : 'itens'}
        </p>
        
        {itens && itens.length > 0 && (
          <div className="flex -space-x-2">
            {itens.slice(0, 4).map((item, index) => (
              <div
                key={index}
                className="w-12 h-12 rounded-lg border-2 border-white overflow-hidden bg-gray-100"
              >
                <img
                  src={item.produto?.imagem || '/placeholder-product.png'}
                  alt={item.produto?.nome}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {itens.length > 4 && (
              <div className="w-12 h-12 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                +{itens.length - 4}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Address (if available) */}
      {endereco && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-medium">Entrega: </span>
            {endereco.rua}, {endereco.numero} - {endereco.bairro}
            {endereco.cidade && `, ${endereco.cidade} - ${endereco.estado}`}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 gap-3">
        <div>
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatarValor(orderTotal)}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-primary-600 font-medium hover:underline text-sm sm:text-base">
            Ver detalhes →
          </span>
          
          {showCancelButton && onCancel && (
            <Button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onCancel()
              }}
              variant="danger"
              size="sm"
              disabled={cancelling}
              loading={cancelling}
              className="w-full sm:w-auto order-last sm:order-none"
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </Link>
  )
}
