import { Link } from 'react-router-dom'
import { FiShoppingCart, FiHeart } from 'react-icons/fi'
import Button from './Button'
import Badge from './Badge'

/**
 * ProductCard Component
 * 
 * Card para exibir produto
 */
export default function ProductCard({ product, onAddToCart, onToggleFavorite }) {
  const {
    id,
    nome,
    descricao,
    preco,
    precoPromocional,
    imagem,
    estoque,
    categoria,
    novo,
    emPromocao,
  } = product

  const precoFinal = precoPromocional || preco?.valor || preco || 0
  const temDesconto = precoPromocional && preco?.valor
  const disponivel = estoque > 0

  // Função segura para formatar valores
  const formatarValor = (valor) => {
    if (typeof valor !== 'number' || isNaN(valor)) {
      return 'R$ 0,00'
    }
    return `R$ ${valor.toFixed(2)}`
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(product)
    }
  }

  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onToggleFavorite) {
      onToggleFavorite(product)
    }
  }

  return (
    <Link
      to={`/produto/${id}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
          {novo && <Badge variant="success">Novo</Badge>}
          {emPromocao && <Badge variant="danger">Promoção</Badge>}
          {!disponivel && <Badge variant="secondary">Esgotado</Badge>}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
        >
          <FiHeart className="w-5 h-5 text-gray-600 hover:text-red-500" />
        </button>

        {/* Product Image */}
        <img
          src={imagem || 'https://placehold.co/600x400/transparent/F00'}
          alt={nome}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Discount Badge */}
        {temDesconto && (
          <div className="absolute bottom-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-sm font-bold">
            -{Math.round(((preco.valor - precoPromocional) / preco.valor) * 100)}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {categoria && (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {categoria.nome || categoria}
          </p>
        )}

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {nome}
        </h3>

        {/* Description */}
        {descricao && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {descricao}
          </p>
        )}

        {/* Price */}
        <div className="mb-3">
          {temDesconto && (
            <p className="text-sm text-gray-500 line-through mb-1">
              R$ {preco.valor.toFixed(2)}
            </p>
          )}
          <p className="text-2xl font-bold text-gray-900">
            {formatarValor(precoFinal)}
          </p>
        </div>

        {/* Stock Info */}
        {disponivel ? (
          estoque < 10 && (
            <p className="text-sm text-orange-600 mb-3">
              Apenas {estoque} {estoque === 1 ? 'unidade' : 'unidades'} disponível
            </p>
          )
        ) : (
          <p className="text-sm text-red-600 mb-3">
            Produto esgotado
          </p>
        )}

        {/* Add to Cart Button */}
        <Button
          variant="primary"
          fullWidth
          leftIcon={<FiShoppingCart />}
          onClick={handleAddToCart}
          disabled={!disponivel}
        >
          {disponivel ? 'Adicionar ao Carrinho' : 'Indisponível'}
        </Button>
      </div>
    </Link>
  )
}
