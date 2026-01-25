import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import { 
  FiShoppingCart, 
  FiTrash2, 
  FiPlus, 
  FiMinus,
  FiArrowLeft,
  FiArrowRight,
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

  // Garantir que items seja sempre um array
  const items = Array.isArray(cartItems) ? cartItems : []

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

  // Calcular frete (simulado)
  const calcularFrete = () => {
    const subtotal = getSubtotal()
    if (subtotal === 0) return 0
    if (subtotal >= 200) return 0 // Frete grátis acima de R$ 200
    return 15.00
  }

  const frete = calcularFrete()
  const subtotal = getSubtotal()
  const desconto = getTotalDiscount()
  const total = getTotal(frete)

  // Incrementar quantidade
  const handleIncrement = (item) => {
    if (item.quantidade < item.estoque) {
      updateQuantity(item.id, item.quantidade + 1)
    }
  }

  // Decrementar quantidade
  const handleDecrement = (item) => {
    if (item.quantidade > 1) {
      updateQuantity(item.id, item.quantidade - 1)
    } else {
      removeItem(item.id)
    }
  }

  // Continuar comprando
  const handleContinueShopping = () => {
    navigate('/produtos')
  }

  // Finalizar compra
  const handleCheckout = () => {
    navigate('/checkout')
  }

  // Limpar carrinho com confirmação
  const handleClearCart = () => {
    if (window.confirm('Deseja realmente esvaziar o carrinho?')) {
      clearCart()
    }
  }

  // Carrinho vazio
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meu Carrinho
          </h1>
          <p className="text-gray-600">
            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'} no carrinho
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Lista de Itens (Esquerda) */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Botão Limpar Carrinho */}
            <div className="flex justify-end">
              <button
                onClick={handleClearCart}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-2"
              >
                <FiTrash2 size={16} />
                Limpar carrinho
              </button>
            </div>

            {/* Itens */}
            {items.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  
                  {/* Imagem */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.imagem || 'https://placehold.co/600x400/transparent/F00'}
                      alt={item.nome}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/600x400/transparent/F00'
                      }}
                    />
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    
                    {/* Nome e Categoria */}
                    <div className="mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {item.nome}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.categoria}
                      </p>
                    </div>

                    {/* Preços */}
                    <div className="mb-4">
                      {(() => {
                        const precoOriginal = getPrecoValue(item.precoOriginal)
                        const preco = getPrecoValue(item.preco)
                        return precoOriginal > preco ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 line-through">
                              {formatarValor(precoOriginal)}
                            </span>
                            <span className="text-lg font-bold text-primary-600">
                              {formatarValor(preco)}
                            </span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {Math.round(((precoOriginal - preco) / precoOriginal) * 100)}% OFF
                            </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          {formatarValor(preco)}
                        </span>
                      )}
                      )()}
                    </div>

                    {/* Controles */}
                    <div className="flex items-center justify-between">
                      
                      {/* Seletor de Quantidade */}
                      <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600">Quantidade:</label>
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => handleDecrement(item)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                            aria-label="Diminuir quantidade"
                          >
                            <FiMinus size={16} />
                          </button>
                          <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                            {item.quantidade}
                          </span>
                          <button
                            onClick={() => handleIncrement(item)}
                            disabled={item.quantidade >= item.estoque}
                            className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Aumentar quantidade"
                          >
                            <FiPlus size={16} />
                          </button>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({item.estoque} disponíveis)
                        </span>
                      </div>

                      {/* Botão Remover */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remover item"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>

                    {/* Subtotal do Item */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Subtotal:</span>
                        <span className="text-lg font-bold text-gray-900">
                          {formatarValor(getPrecoValue(item.preco) * item.quantidade)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumo do Pedido (Direita) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Resumo do Pedido
              </h2>

              {/* Valores */}
              <div className="space-y-3 mb-6">
                
                {/* Subtotal */}
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({getTotalItems()} itens)</span>
                  <span>{formatarValor(subtotal)}</span>
                </div>

                {/* Desconto */}
                {desconto > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <FiTag size={16} />
                      Desconto
                    </span>
                    <span>- {formatarValor(desconto)}</span>
                  </div>
                )}

                {/* Frete */}
                <div className="flex justify-between text-gray-700">
                  <span className="flex items-center gap-1">
                    <FiTruck size={16} />
                    Frete
                  </span>
                  <span>
                    {frete === 0 ? (
                      <span className="text-green-600 font-medium">Grátis</span>
                    ) : (
                      formatarValor(frete)
                    )}
                  </span>
                </div>

                {/* Mensagem Frete Grátis */}
                {frete > 0 && subtotal < 200 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      Faltam <strong>{formatarValor(200 - subtotal)}</strong> para frete grátis!
                    </p>
                  </div>
                )}

                {/* Divisor */}
                <div className="border-t border-gray-200 my-3"></div>

                {/* Total */}
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-primary-600">{formatarValor(total)}</span>
                </div>
              </div>

              {/* Botões */}
              <div className="space-y-3">
                <Button 
                  onClick={handleCheckout}
                  className="w-full"
                  size="lg"
                  disabled={items.length === 0}
                >
                  <FiLock className="mr-2" />
                  Finalizar Compra ({items.length} {items.length === 1 ? 'item' : 'itens'})
                </Button>

                <Button 
                  onClick={handleContinueShopping}
                  variant="outline"
                  className="w-full"
                >
                  <FiArrowLeft className="mr-2" />
                  Continuar Comprando
                </Button>
              </div>

              {/* Informações Extras */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <FiTruck className="mt-0.5 text-primary-600 flex-shrink-0" />
                  <span>Entrega em até 7 dias úteis</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <FiLock className="mt-0.5 text-primary-600 flex-shrink-0" />
                  <span>Ambiente 100% seguro</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <FiTag className="mt-0.5 text-primary-600 flex-shrink-0" />
                  <span>Melhores preços do mercado</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continuar Comprando (Mobile) */}
        <div className="mt-8 lg:hidden">
          <Button 
            onClick={handleContinueShopping}
            variant="outline"
            className="w-full"
          >
            <FiArrowLeft className="mr-2" />
            Continuar Comprando
          </Button>
        </div>
      </div>
    </div>
  )
}