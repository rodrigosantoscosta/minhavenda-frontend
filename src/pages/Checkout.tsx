import { useState, useEffect, useCallback, useMemo } from 'react'
import type React from 'react'
import type { Order } from '../types'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useNotificationContext } from '../contexts/NotificationContext'
import { registerOrderStatus } from '../services/notificationService'
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
import logger from '../utils/logger'

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  // FIX: use clearCart() instead of setItems([]) so the backend cart is also cleared
  const { items: cartItems, clearCart } = useCart()
  const { addNotification } = useNotificationContext()
  
  const items = useMemo(() => Array.isArray(cartItems) ? cartItems : [], [cartItems])

  const [endereco, setEndereco] = useState({})
  const [enderecoValido, setEnderecoValido] = useState(false)
  const [enderecoErrors, setEnderecoErrors] = useState({})
  const [paymentMethod, setPaymentMethod] = useState('PIX')
  const [installments, setInstallments] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')

  const formatarValor = (valor: number) => {
    if (typeof valor !== 'number' || isNaN(valor)) return 'R$ 0,00'
    return `R$ ${valor.toFixed(2)}`
  }

  useEffect(() => {
    if (!user || !user.email) {
      logger.warn({ hasUser: !!user, email: user?.email }, 'Usuário não autenticado ou dados incompletos')
      navigate('/login?redirect=/checkout')
    }
  }, [user, navigate])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (items.length === 0 && !showSuccessModal) {
        navigate('/carrinho')
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [items, navigate, showSuccessModal])

  const calcularValores = () => {
    const subtotal = items.reduce((total, item) => {
      const precoItem = typeof item.preco === 'object' ? (item.preco as any)?.valor : item.preco
      return total + ((precoItem || 0) * item.quantidade)
    }, 0)

    const desconto = items.reduce((total, item) => {
      const precoItem = typeof item.preco === 'object' ? (item.preco as any)?.valor : item.preco
      const precoOriginalItem = typeof item.precoOriginal === 'object' ? (item.precoOriginal as any)?.valor : item.precoOriginal
      const preco = precoItem || 0
      const precoOriginal = precoOriginalItem || preco
      return precoOriginal > preco ? total + ((precoOriginal - preco) * item.quantidade) : total
    }, 0)

    const frete = endereco ? calcularFrete(subtotal, endereco) : 0
    const total = subtotal - desconto + frete
    return { subtotal, desconto, frete, total }
  }

  const { subtotal, desconto, frete, total } = calcularValores()

  const calcularParcelas = (valorTotal: number) => {
    const maxParcelas = valorTotal >= 100 ? 12 : 6
    const parcelas = []
    for (let i = 1; i <= maxParcelas; i++) {
      const valorParcela = valorTotal / i
      if (valorParcela >= 10) {
        parcelas.push({
          numero: i,
          valor: valorParcela,
          texto: `${i}x de ${formatarValor(valorParcela)} (sem juros)`
        })
      }
    }
    return parcelas
  }

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

  const handleAddressChange = useCallback(({ address, isValid, errors: addrErrors }: { address: Record<string, string>; isValid: boolean; errors?: Record<string, string> }) => {
    setEndereco(address)
    setEnderecoValido(isValid)
    setEnderecoErrors(addrErrors)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
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
        valores: { subtotal, desconto, frete, total },
        total,
        usuario: {
          id: user?.id || '1',
          nome: user?.nome || user?.name || 'Usuário',
          email: user?.email || 'usuario@exemplo.com'
        }
      }

      const order = await createOrder(orderData as any)

      registerOrderStatus(String(order.id), order.status || 'PENDENTE')

      const shortId = String(order.id ?? '').slice(-6) || order.id
      addNotification({
        type: 'new_order',
        title: 'Pedido realizado com sucesso',
        message: `Pedido #${shortId} foi criado. Acompanhe o status pelo sino.`,
        orderId: String(order.id),
      })

      setCreatedOrder(order)
      setShowSuccessModal(true)

      // FIX: clearCart() calls DELETE /carrinho for authenticated users,
      // keeping backend and frontend state in sync.
      // Previously: setItems([]) + localStorage.removeItem('cart')
      // only cleared local state — a refresh would reload the old cart from the server.
      await clearCart()

    } catch (err) {
      logger.error({ error: (err as Error).message, stack: (err as Error).stack }, 'Erro ao criar pedido')
      setError((err as Error).message || 'Ocorreu um erro ao processar seu pedido. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false)
    if (createdOrder) navigate(`/pedido/${createdOrder.id}`)
  }, [createdOrder, navigate])

  if (!user || (items.length === 0 && !showSuccessModal)) return <Loading />

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
              <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
              {/* <p className="text-gray-600">Ambiente 100% seguro - Página criptografada</p> */}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-900 mb-1">Erro ao processar pedido</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <AddressForm onAddressChange={handleAddressChange} errors={enderecoErrors} />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary-50 rounded-lg">
                  <FiCreditCard className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Forma de Pagamento</h3>
                  <p className="text-sm text-gray-600">Escolha como deseja pagar</p>
                </div>
              </div>

              <div className="space-y-4">
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
                    <div className="cursor-pointer rounded-lg border-2 p-4 text-center transition-all peer-checked:border-primary-600 peer-checked:bg-primary-50 peer-checked:text-primary-700 border-gray-200 hover:border-gray-300">
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
                    <div className="cursor-pointer rounded-lg border-2 p-4 text-center transition-all peer-checked:border-primary-600 peer-checked:bg-primary-50 peer-checked:text-primary-700 border-gray-200 hover:border-gray-300">
                      <div className="font-medium">Cartão</div>
                      <div className="text-sm text-gray-500">parcelado</div>
                    </div>
                  </label>
                </div>

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
                        <option key={parcela.numero} value={parcela.numero}>{parcela.texto}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    {paymentMethod === 'PIX' && (
                      <div className="flex items-center gap-2 text-green-700">
                        <FiCheck className="w-4 h-4" />
                        {/* <span>5% de desconto no pagamento via PIX</span> */}
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

          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              <OrderSummary
                items={items}
                endereco={endereco}
                pagamento={{ metodo: paymentMethod, parcelas: installments }}
                showAddress={!!endereco}
                showPayment={true}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!enderecoValido || isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? 'Processando...' : (
                  <>
                    <FiLock className="mr-2" />
                    Confirmar Pedido
                  </>
                )}
              </Button>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FiTruck className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Importante:</p>
                    <ul className="space-y-1 text-amber-700">
                      <li>Verifique se o endereço está correto</li>
                      <li>O pedido será processado após confirmação</li>
                      <li>Você receberá um e-mail com os detalhes</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Ao confirmar, você aceita nossos{' '}
                <a href="/termos" className="text-primary-600 hover:underline">Termos de Serviço</a>
                {' '}e{' '}
                <a href="/privacidade" className="text-primary-600 hover:underline">Política de Privacidade</a>
              </div>
            </div>
          </div>
        </form>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        order={createdOrder as any}
        autoCloseDelay={0}
      />
    </div>
  )
}
