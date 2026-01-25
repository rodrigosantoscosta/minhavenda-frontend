import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import AddressForm from '../components/checkout/AddressForm'
import OrderSummary from '../components/checkout/OrderSummary'
import SuccessModal from '../components/common/SuccessModal'
import Button from '../components/common/Button'
import Loading from '../components/common/Loading'
import { createOrder, calcularFrete } from '../services/checkoutService'
import { 
  FiArrowLeft, 
  FiLock, 
  FiCreditCard, 
  FiTruck,
  FiAlertCircle,
  FiCheck
} from 'react-icons/fi'

/**
 * Checkout Page
 * 
 * Página de finalização de pedido com formulário de endereço
 * e resumo do pedido
 */
export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items: cartItems, setItems } = useCart()
  
  // Garantir que items seja sempre um array
  const items = useMemo(() => Array.isArray(cartItems) ? cartItems : [], [cartItems])

  // Estados do formulário
  const [endereco, setEndereco] = useState({})
  const [enderecoValido, setEnderecoValido] = useState(false)
  const [enderecoErrors, setEnderecoErrors] = useState({})

  // Estados do pagamento
  const [paymentMethod, setPaymentMethod] = useState('PIX')
  const [installments, setInstallments] = useState(1)

  // Estados da UI
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdOrder, setCreatedOrder] = useState(null)
  const [error, setError] = useState('')







  // Função segura para formatar valores
  const formatarValor = (valor) => {
    if (typeof valor !== 'number' || isNaN(valor)) {
      return 'R$ 0,00'
    }
    return `R$ ${valor.toFixed(2)}`
  }

  // Verificar se usuário está logado
  useEffect(() => {
    if (!user || !user.email) {
      logger.warn('Usuário não autenticado ou dados incompletos', { hasUser: !!user, email: user?.email })
      navigate('/login?redirect=/checkout')
    }
  }, [user, navigate])

  // Verificar se carrinho está vazio (com delay para evitar race conditions)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Só redirecionar se o modal de sucesso NÃO estiver aberto
      if (items.length === 0 && !showSuccessModal) {
        navigate('/carrinho')
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [items, navigate, showSuccessModal])

  // Calcular valores
  const calcularValores = () => {
    const subtotal = items.reduce((total, item) => {
      const precoItem = typeof item.preco === 'object' ? item.preco.valor : item.preco
      const preco = precoItem || 0
      return total + (preco * item.quantidade)
    }, 0)

    const desconto = items.reduce((total, item) => {
      const precoItem = typeof item.preco === 'object' ? item.preco.valor : item.preco
      const precoOriginalItem = typeof item.precoOriginal === 'object' ? item.precoOriginal.valor : item.precoOriginal
      
      const preco = precoItem || 0
      const precoOriginal = precoOriginalItem || preco
      
      if (precoOriginal > preco) {
        return total + ((precoOriginal - preco) * item.quantidade)
      }
      return total
    }, 0)

    const frete = endereco ? calcularFrete(subtotal, endereco) : 0
    const total = subtotal - desconto + frete

    return { subtotal, desconto, frete, total }
  }

  const { subtotal, desconto, frete, total } = calcularValores()

  // Calcular parcelas
  const calcularParcelas = (valorTotal) => {
    const maxParcelas = valorTotal >= 100 ? 12 : 6
    const minParcela = 10
    
    const parcelas = []
    for (let i = 1; i <= maxParcelas; i++) {
      const valorParcela = valorTotal / i
      if (valorParcela >= minParcela) {
        parcelas.push({
          numero: i,
          valor: valorParcela,
          texto: `${i}x de ${formatarValor(valorParcela)} ${i === 1 ? '(sem juros)' : '(sem juros)'}`
        })
      }
    }
    
    return parcelas
  }

  // Validar formulário completo
  const validateForm = () => {
    if (!enderecoValido) {
      setError('Por favor, preencha corretamente o endereço de entrega.')
      return false
    }

    if (!paymentMethod) {
      setError('Por favor, selecione uma forma de pagamento.')
      return false
    }

    if (items.length === 0) {
      setError('Seu carrinho está vazio.')
      return false
    }

    return true
  }

  // Lidar com mudanças no endereço
  const handleAddressChange = useCallback(({ address, isValid, errors }) => {
    setEndereco(address)
    setEnderecoValido(isValid)
    setEnderecoErrors(errors)
  }, [])

  // Finalizar pedido
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar dados do pedido
      const orderData = {
        items: items.map(item => ({
          id: item.id,
          nome: item.nome,
          imagem: item.imagem,
          quantidade: item.quantidade,
          preco: item.preco,
          precoOriginal: item.precoOriginal
        })),
        endereco,
        pagamento: {
          metodo: paymentMethod,
          parcelas: paymentMethod === 'CREDIT_CARD' ? installments : 1
        },
        valores: {
          subtotal,
          desconto,
          frete,
          total
        },
        total,
        usuario: {
          id: user?.id || '1',
          nome: user?.nome || user?.name || 'Usuário',
          email: user?.email || 'usuario@exemplo.com'
        }
      }

      // Criar pedido
      const order = await createOrder(orderData)
      
      // Salvar pedido criado
      setCreatedOrder(order)
      
      // Mostrar modal de sucesso ANTES de limpar carrinho
      setShowSuccessModal(true)
      
      // Limpar carrinho localmente imediatamente
      setItems([])
      localStorage.removeItem('cart')

    } catch (err) {
      logger.error('Erro ao criar pedido', { error: err.message, stack: err.stack })
      setError(err.message || 'Ocorreu um erro ao processar seu pedido. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fechar modal de sucesso e redirecionar
  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false)
    if (createdOrder) {
      navigate(`/pedido/${createdOrder.id}`)
    }
  }, [createdOrder, navigate])

  // Usuário não logado ou carrinho vazio (mas não se modal de sucesso está aberto)
  if (!user || (items.length === 0 && !showSuccessModal)) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/carrinho">
              <Button variant="ghost" size="sm">
                <FiArrowLeft className="mr-2" />
                Voltar ao Carrinho
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-50 rounded-lg">
              <FiLock className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Finalizar Compra
              </h1>
              <p className="text-gray-600">
                Ambiente 100% seguro • Página criptografada
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-900 mb-1">
                  Erro ao processar pedido
                </h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Esquerda - Formulário */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Endereço de Entrega */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <AddressForm
                onAddressChange={handleAddressChange}
                errors={enderecoErrors}
              />
            </div>

            {/* Forma de Pagamento */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <FiCreditCard className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Forma de Pagamento
                  </h3>
                  <p className="text-sm text-gray-600">
                    Escolha como deseja pagar
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Métodos de Pagamento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="relative">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PIX"
                      checked={paymentMethod === 'PIX'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only peer"
                    />
                    <div className={`
                      cursor-pointer rounded-lg border-2 p-4 text-center transition-all
                      peer-checked:border-primary-600 peer-checked:bg-primary-50
                      peer-checked:text-primary-700 border-gray-200 hover:border-gray-300
                    `}>
                      <div className="font-medium">PIX</div>
                      <div className="text-sm text-gray-500">à vista</div>
                    </div>
                  </label>

                  <label className="relative">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CREDIT_CARD"
                      checked={paymentMethod === 'CREDIT_CARD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only peer"
                    />
                    <div className={`
                      cursor-pointer rounded-lg border-2 p-4 text-center transition-all
                      peer-checked:border-primary-600 peer-checked:bg-primary-50
                      peer-checked:text-primary-700 border-gray-200 hover:border-gray-300
                    `}>
                      <div className="font-medium">Cartão</div>
                      <div className="text-sm text-gray-500">parcelado</div>
                    </div>
                  </label>
                </div>

                {/* Parcelas (Cartão de Crédito) */}
                {paymentMethod === 'CREDIT_CARD' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Parcelas
                    </label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {calcularParcelas(total).map((parcela) => (
                        <option key={parcela.numero} value={parcela.numero}>
                          {parcela.texto}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Informações de Pagamento */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    {paymentMethod === 'PIX' && (
                      <div className="flex items-center gap-2 text-green-700">
                        <FiCheck className="w-4 h-4" />
                        <span>5% de desconto no pagamento via PIX</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <FiLock className="w-4 h-4" />
                      <span>Pagamento 100% seguro</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Resumo */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              
              {/* Resumo do Pedido */}
              <OrderSummary
                items={items}
                endereco={endereco}
                pagamento={{ metodo: paymentMethod, parcelas: installments }}
                showAddress={!!endereco}
                showPayment={true}
              />

              {/* Botão de Finalizar */}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!enderecoValido || isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? (
                  'Processando...'
                ) : (
                  <>
                    <FiLock className="mr-2" />
                    Confirmar Pedido
                  </>
                )}
              </Button>

              {/* Informações de Segurança */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FiTruck className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Importante:</p>
                    <ul className="space-y-1 text-amber-700">
                      <li>• Verifique se o endereço está correto</li>
                      <li>• O pedido será processado após confirmação</li>
                      <li>• Você receberá um e-mail com os detalhes</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Termos e Condições */}
              <div className="text-xs text-gray-500 text-center">
                Ao confirmar, você aceita nossos{' '}
                <a href="/termos" className="text-primary-600 hover:underline">
                  Termos de Serviço
                </a>{' '}
                e{' '}
                <a href="/privacidade" className="text-primary-600 hover:underline">
                  Política de Privacidade
                </a>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Modal de Sucesso */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        order={createdOrder}
        autoCloseDelay={0}
      />
    </div>
  )
}