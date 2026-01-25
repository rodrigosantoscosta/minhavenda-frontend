import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import Button from './Button'
import { 
  FiCheckCircle, 
  FiPackage, 
  FiTruck, 
  FiClock,
  FiArrowRight,
  FiShoppingBag,
  FiFileText
} from 'react-icons/fi'

/**
 * SuccessModal Component
 * 
 * Modal de sucesso para confirmação de pedido
 * Exibe informações do pedido criado e próximas ações
 */
export default function SuccessModal({ 
  isOpen, 
  onClose, 
  order, 
  autoCloseDelay = 8000,
  showActions = true 
}) {
  const navigate = useNavigate()
  const onCloseRef = useRef(onClose)
  
  // Atualizar ref quando onClose mudar
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

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

  // Auto close após delay
  useEffect(() => {
    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onCloseRef.current()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [isOpen, autoCloseDelay])

  // Navegar para detalhes do pedido
  const handleViewOrder = () => {
    onClose()
    navigate(`/pedido/${order.id}`)
  }

  // Navegar para lista de pedidos
  const handleViewOrders = () => {
    onClose()
    navigate('/pedidos')
  }

  // Continuar comprando
  const handleContinueShopping = () => {
    onClose()
    navigate('/produtos')
  }

  // Formatar data
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Calcular estimativa de entrega
  const getDeliveryEstimate = () => {
    const orderDate = new Date(order.dataCriacao)
    const deliveryDate = new Date(orderDate)
    
    // Adicionar 7 dias úteis (aproximado)
    let daysAdded = 0
    while (daysAdded < 7) {
      deliveryDate.setDate(deliveryDate.getDate() + 1)
      if (deliveryDate.getDay() !== 0 && deliveryDate.getDay() !== 6) {
        daysAdded++
      }
    }
    
    return deliveryDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long'
    })
  }

  if (!order) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={true}
      closeOnOverlayClick={false}
    >
      <div className="text-center space-y-6">
        
        {/* Ícone de Sucesso */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <FiCheckCircle className="w-10 h-10 text-green-600" />
            </div>
            {/* Animação de círculo */}
            <div className="absolute inset-0 w-20 h-20 bg-green-200 rounded-full animate-ping opacity-20" />
          </div>
        </div>

        {/* Mensagem Principal */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pedido Confirmado!
          </h2>
          <p className="text-gray-600">
            Seu pedido foi criado com sucesso e já está sendo processado.
          </p>
        </div>

        {/* Informações do Pedido */}
        <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Número do Pedido:</span>
            <span className="font-mono font-semibold text-primary-600">
              {order.id}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Data do Pedido:</span>
            <span className="text-sm text-gray-900">
              {formatDate(order.dataCriacao)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Valor Total:</span>
            <span className="font-semibold text-gray-900">
              {formatarValor(order.valores?.total || order.total)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Forma de Pagamento:</span>
            <span className="text-sm text-gray-900 capitalize">
              {order.pagamento?.metodo?.replace('_', ' ') || 'Pix'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Previsão de Entrega:</span>
            <span className="text-sm text-gray-900">
              Até {getDeliveryEstimate()}
            </span>
          </div>
        </div>

        {/* Próximos Passos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
            <FiClock className="w-4 h-4" />
            Próximos Passos
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
              <span>Você receberá um e-mail com a confirmação do pedido</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
              <span>Aguardando aprovação do pagamento</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
              <span>Após aprovação, seu pedido será separado e enviado</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0" />
              <span>Você receberá o código de rastreamento por e-mail</span>
            </div>
          </div>
        </div>

        {/* Resumo Rápido dos Itens */}
        {order.itens && order.itens.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <FiPackage className="w-4 h-4" />
              Resumo do Pedido ({order.itens.length} {order.itens.length === 1 ? 'item' : 'itens'})
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {order.itens.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.produto?.imagem || 'https://placehold.co/600x400/transparent/F00'}
                      alt={item.produto?.nome}
                      className="w-8 h-8 object-cover rounded bg-gray-100"
                    />
                    <span className="text-gray-700">
                      {item.quantidade}x {item.produto?.nome || item.nome}
                    </span>
                  </div>
                  <span className="text-gray-900 font-medium">
                    {formatarValor(item.subtotal || (item.precoUnitario * item.quantidade))}
                  </span>
                </div>
              ))}
              {order.itens.length > 3 && (
                <div className="text-sm text-gray-500 text-center pt-1">
                  +{order.itens.length - 3} outros itens
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ações */}
        {showActions && (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                onClick={handleViewOrder}
                className="w-full"
                variant="outline"
              >
                <FiFileText className="mr-2" />
                Ver Detalhes
              </Button>
              
              <Button
                onClick={handleViewOrders}
                className="w-full"
                variant="outline"
              >
                <FiShoppingBag className="mr-2" />
                Meus Pedidos
              </Button>
            </div>
            
            <Button
              onClick={handleContinueShopping}
              className="w-full"
            >
              <FiArrowRight className="mr-2" />
              Continuar Comprando
            </Button>
          </div>
        )}

        {/* Informação de Auto-fechamento */}
        {autoCloseDelay > 0 && (
          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
            Esta janela fechará automaticamente em {autoCloseDelay / 1000} segundos
          </div>
        )}
      </div>
    </Modal>
  )
}

/**
 * OrderCreatedModal
 * 
 * Versão simplificada para quando não temos todos os dados do pedido
 */
export function OrderCreatedModal({ 
  isOpen, 
  onClose, 
  orderId, 
  total,
  ...props 
}) {
  const mockOrder = {
    id: orderId,
    dataCriacao: new Date().toISOString(),
    total,
    valores: { total },
    pagamento: { metodo: 'PIX' },
    itens: []
  }

  return (
    <SuccessModal
      isOpen={isOpen}
      onClose={onClose}
      order={mockOrder}
      {...props}
    />
  )
}

/**
 * PaymentSuccessModal
 * 
 * Modal específico para sucesso de pagamento
 */
export function PaymentSuccessModal({ 
  isOpen, 
  onClose, 
  order, 
  ...props 
}) {
  return (
    <SuccessModal
      isOpen={isOpen}
      onClose={onClose}
      order={order}
      {...props}
    />
  )
}