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
import CheckoutSteps from '../components/checkout/CheckoutSteps'
import PaymentSelector, { type PaymentMethod } from '../components/checkout/PaymentSelector'
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
  const { items: cartItems, clearCart } = useCart()
  const { addNotification } = useNotificationContext()
  
  const items = useMemo(() => Array.isArray(cartItems) ? cartItems : [], [cartItems])

  const [endereco, setEndereco] = useState<Record<string, string> | undefined>(undefined)
  const [enderecoValido, setEnderecoValido] = useState(false)
  const [enderecoErrors, setEnderecoErrors] = useState({})
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX')
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
    if (address) setEndereco(address as any)
    setEnderecoValido(isValid)
    setEnderecoErrors(addrErrors as any)
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
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        
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
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-secondary rounded-xl">
              <FiLock className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">Finalizar Compra</h1>
            </div>
          </div>

          {/* Steps */}
          <CheckoutSteps currentStep={1} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-destructive/5 border border-destructive/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-destructive mb-1">Erro ao processar pedido</h3>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address */}
            <div className="bg-card rounded-xl shadow-card border border-border p-6">
              <h3 className="font-sans font-semibold text-lg text-foreground mb-4">Endereço de Entrega</h3>
              <AddressForm onAddressChange={handleAddressChange as any} errors={enderecoErrors} />
            </div>

            {/* Payment */}
            <div className="bg-card rounded-xl shadow-card border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-secondary rounded-lg">
                  <FiCreditCard className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-lg text-foreground">Forma de Pagamento</h3>
                  <p className="text-sm text-muted-foreground">Escolha como deseja pagar</p>
                </div>
              </div>

              <div className="space-y-4">
                <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />

                {paymentMethod === 'CREDIT_CARD' && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Número de Parcelas
                    </label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:ring-2 focus:ring-ring focus:border-ring text-sm"
                    >
                      {calcularParcelas(total).map((parcela) => (
                        <option key={parcela.numero} value={parcela.numero}>{parcela.texto}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="space-y-2 text-sm">
                    {paymentMethod === 'PIX' && (
                      <div className="flex items-center gap-2 text-success">
                        <FiCheck className="w-4 h-4" />
                        <span>Pagamento instantâneo — confirmação imediata</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FiLock className="w-4 h-4" />
                      <span>Pagamento 100% seguro</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <OrderSummary
                items={items}
                endereco={endereco}
                pagamento={{ metodo: paymentMethod, parcelas: installments }}
                showAddress={!!endereco}
                showPayment={true}
              />

              <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <FiTruck className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-warning/80">
                    <p className="font-medium mb-1">Importante:</p>
                    <ul className="space-y-1">
                      <li>Verifique se o endereço está correto</li>
                      <li>O pedido será processado após confirmação</li>
                      <li>Você receberá um e-mail com os detalhes</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Ao confirmar, você aceita nossos{' '}
                <a href="/termos" className="text-foreground hover:underline">Termos de Serviço</a>
                {' '}e{' '}
                <a href="/privacidade" className="text-foreground hover:underline">Política de Privacidade</a>
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
