import { Link, useNavigate } from 'react-router-dom'
import type { CartItem } from '../types'
import { useCart } from '../contexts/CartContext'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import { 
  FiShoppingCart, 
  FiTrash2, 
  FiPlus, 
  FiMinus,
  FiArrowLeft,
  FiTag,
  FiTruck,
  FiLock
} from 'react-icons/fi'

export default function Cart() {
  const navigate = useNavigate()
  const {
    items: cartItems,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getSubtotal,
    getTotalDiscount,
    getTotal
  } = useCart()

  const items = Array.isArray(cartItems) ? cartItems : []

  const getPrecoValue = (preco: number | { valor?: number } | null | undefined): number => {
    if (typeof preco === 'object' && preco !== null) return preco.valor || 0
    return preco || 0
  }

  const formatarValor = (valor: number | { valor?: number } | null | undefined) => {
    const preco = getPrecoValue(valor)
    if (typeof preco !== 'number' || isNaN(preco)) return 'R$ 0,00'
    return `R$ ${preco.toFixed(2)}`
  }

  const calcularFrete = () => {
    const subtotal = getSubtotal()
    if (subtotal === 0) return 0
    if (subtotal >= 200) return 0
    return 15.00
  }

  const frete = calcularFrete()
  const subtotal = getSubtotal()
  const desconto = getTotalDiscount()
  const total = getTotal(frete)

  const handleIncrement = (item: CartItem) => {
    if (item.estoque == null || item.quantidade < item.estoque) {
      updateQuantity(item.id!, item.quantidade + 1)
    }
  }

  const handleDecrement = (item: CartItem) => {
    if (item.quantidade > 1) {
      updateQuantity(item.id!, item.quantidade - 1)
    } else {
      removeItem(item.id!)
    }
  }

  const handleContinueShopping = () => navigate('/produtos')
  const handleCheckout = () => navigate('/checkout')
  const handleClearCart = () => {
    if (window.confirm('Deseja realmente esvaziar o carrinho?')) clearCart()
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4">
          <EmptyState
            icon={<FiShoppingCart size={64} />}
            title="Seu carrinho está vazio"
            description="Adicione produtos ao carrinho para continuar comprando"
            action={
              <Link to="/produtos">
                <Button>
                  <FiShoppingCart className="mr-2" />
                  Ver Produtos
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Meu Carrinho</h1>
          <p className="font-sans text-muted-foreground">
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'} no carrinho
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-end">
              <button
                onClick={handleClearCart}
                className="text-sm text-destructive hover:text-destructive/80 flex items-center gap-2 transition-colors"
              >
                <FiTrash2 size={16} />
                Limpar carrinho
              </button>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="bg-card rounded-xl shadow-card p-4 sm:p-6 border border-border"
              >
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.imagem || 'https://placehold.co/600x400/e5e7eb/9ca3af?text=Sem+imagem'}
                      alt={item.nome}
                      className="w-24 h-24 object-cover rounded-lg"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/e5e7eb/9ca3af?text=Sem+imagem' }}
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <h3 className="font-display text-lg font-semibold text-foreground truncate">{item.nome}</h3>
                      <p className="font-sans text-sm text-muted-foreground">{item.categoria}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      {(() => {
                        const precoOriginal = getPrecoValue(item.precoOriginal)
                        const preco = getPrecoValue(item.preco)
                        return precoOriginal > preco ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground line-through tabular-nums">{formatarValor(precoOriginal)}</span>
                            <span className="text-lg font-bold text-foreground tabular-nums">{formatarValor(preco)}</span>
                            <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded font-medium">
                              {Math.round(((precoOriginal - preco) / precoOriginal) * 100)}% OFF
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-bold text-foreground tabular-nums">{formatarValor(preco)}</span>
                        )
                      })()}
                    </div>

                    {/* Quantity + Remove */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-muted-foreground">Quantidade:</label>
                        <div className="flex items-center border border-border rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleDecrement(item)}
                            className="p-2 hover:bg-muted transition-colors"
                            aria-label="Diminuir quantidade"
                          >
                            <FiMinus size={16} />
                          </button>
                          <span className="px-4 py-2 min-w-[3rem] text-center font-medium tabular-nums border-x border-border">
                            {item.quantidade}
                          </span>
                          <button
                            onClick={() => handleIncrement(item)}
                            disabled={item.estoque != null && item.quantidade >= item.estoque}
                            className="p-2 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Aumentar quantidade"
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>
                        {item.estoque != null && (
                          <span className="text-xs text-muted-foreground">{item.estoque} disponíveis</span>
                        )}
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-destructive hover:text-destructive/80 p-2 hover:bg-destructive/5 rounded-lg transition-colors"
                        aria-label="Remover item"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Subtotal:</span>
                        <span className="text-lg font-bold text-foreground tabular-nums">
                          {formatarValor(getPrecoValue(item.preco) * item.quantidade)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-card p-6 sticky top-20 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Resumo do Pedido</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal ({getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'})</span>
                  <span className="font-medium tabular-nums">{formatarValor(subtotal)}</span>
                </div>

                {desconto > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span className="flex items-center gap-1"><FiTag size={14} />Desconto</span>
                    <span className="font-medium tabular-nums">- {formatarValor(desconto)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground"><FiTruck size={14} />Frete</span>
                  <span className="font-medium tabular-nums">
                    {frete === 0
                      ? <span className="text-success font-medium">Grátis</span>
                      : formatarValor(frete)
                    }
                  </span>
                </div>

                {frete > 0 && subtotal < 200 && (
                  <div className="bg-secondary border border-border rounded-lg p-3">
                    <p className="text-sm text-foreground">
                      Faltam <strong className="tabular-nums">{formatarValor(200 - subtotal)}</strong> para frete grátis!
                    </p>
                  </div>
                )}

                <div className="border-t border-border my-3"></div>

                <div className="flex justify-between text-lg font-semibold text-foreground">
                  <span>Total</span>
                  <span className="tabular-nums">{formatarValor(total)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button onClick={handleCheckout} className="w-full" size="lg" disabled={items.length === 0}>
                  <FiLock className="mr-2" />
                  Finalizar Compra
                </Button>
                <Button onClick={handleContinueShopping} variant="outline" className="w-full">
                  <FiArrowLeft className="mr-2" />
                  Continuar Comprando
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <FiTruck className="mt-0.5 text-foreground flex-shrink-0" size={16} />
                  <span>Entrega em até 7 dias úteis</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <FiLock className="mt-0.5 text-foreground flex-shrink-0" size={16} />
                  <span>Ambiente 100% seguro</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <FiTag className="mt-0.5 text-foreground flex-shrink-0" size={16} />
                  <span>Melhores preços do mercado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
