import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../../contexts/CartContext'
import Button from '../Button'
import Badge from '../Badge'
import { 
  FiShoppingCart, 
  FiHeart, 
  FiEye,
  FiStar,
  FiTrendingUp
} from 'react-icons/fi'

export default function ProductCard({ produto, viewMode = 'grid' }) {
  const { addItem, isInCart } = useCart()
  const [isFavorite, setIsFavorite] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(produto, 1)
  }

  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
  }

  const calcularDesconto = () => {
    if (!produto.precoPromocional) return 0
    const desconto = ((produto.preco.valor - produto.precoPromocional) / produto.preco.valor) * 100
    return Math.round(desconto)
  }

  const desconto = calcularDesconto()
  const precoFinal = produto.precoPromocional || produto.preco.valor
  const temEstoque = produto.quantidadeEstoque > 0
  const estoqueMinimo = produto.quantidadeEstoque <= 5 && produto.quantidadeEstoque > 0

  return (
    <Link 
      to={`/produto/${produto.id}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={imageError ? 'https://placehold.co/600x400/transparent/F00' : produto.imagem}
          alt={produto.nome}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {desconto > 0 && (
            <Badge variant="danger" size="sm">
              -{desconto}%
            </Badge>
          )}
          {produto.destaque && (
            <Badge variant="warning" size="sm">
              <FiTrendingUp className="mr-1" size={12} />
              Destaque
            </Badge>
          )}
          {!temEstoque && (
            <Badge variant="dark" size="sm">
              Esgotado
            </Badge>
          )}
        </div>

        <button
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 p-2 rounded-full bg-white shadow-md transition-all ${
            isFavorite ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-500 hover:scale-110'
          }`}
        >
          <FiHeart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button variant="white" size="sm" className="shadow-lg">
            <FiEye className="mr-2" />
            Ver Detalhes
          </Button>
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
          {produto.categoriaNome || 'Sem categoria'}
        </p>

        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
          {produto.nome}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                size={14}
                className={i < (produto.avaliacao || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
              />
            ))}
          </div>
          <span className="text-xs text-gray-600">
            ({produto.numeroAvaliacoes || 0})
          </span>
        </div>

        <div className="mb-4">
          {desconto > 0 && (
            <p className="text-sm text-gray-500 line-through">
              R$ {produto.preco.valor.toFixed(2)}
            </p>
          )}
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-primary-600">
              R$ {precoFinal.toFixed(2)}
            </p>
            {desconto > 0 && (
              <span className="text-xs text-green-600 font-medium">
                Economize R$ {(produto.preco.valor - precoFinal).toFixed(2)}
              </span>
            )}
          </div>
        </div>

        {estoqueMinimo && (
          <p className="text-xs text-orange-600 mb-3 font-medium">
            ⚠️ Últimas {produto.quantidadeEstoque} unidades!
          </p>
        )}

        <Button
          onClick={handleAddToCart}
          fullWidth
          disabled={!temEstoque}
          variant={isInCart(produto.id) ? 'success' : 'primary'}
          size="sm"
        >
          <FiShoppingCart className="mr-2" />
          {!temEstoque ? 'Indisponível' : isInCart(produto.id) ? 'No Carrinho' : 'Adicionar'}
        </Button>
      </div>
    </Link>
  )
}
