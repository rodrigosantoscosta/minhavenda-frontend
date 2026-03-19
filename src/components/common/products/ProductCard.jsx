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

  // NestJS returns preco as a plain number; guard against legacy { valor } shape
  const precoBase = typeof produto.preco === 'object' ? produto.preco?.valor : produto.preco
  const precoPromocional = produto.precoPromocional ?? null

  // FIX: do NOT default to 1 — use null to mean "unknown/no limit", 0 means out of stock
  const quantidadeEstoque = produto.quantidadeEstoque ?? null

  const calcularDesconto = () => {
    if (!precoPromocional || !precoBase) return 0
    return Math.round(((precoBase - precoPromocional) / precoBase) * 100)
  }

  const desconto = calcularDesconto()
  const precoFinal = precoPromocional ?? precoBase ?? 0

  // Out of stock only when we explicitly know qty === 0; null = assume available
  const temEstoque = quantidadeEstoque === null || quantidadeEstoque > 0
  const estoqueMinimo = quantidadeEstoque !== null && quantidadeEstoque <= 5 && quantidadeEstoque > 0

  const imgSrc = imageError || !produto.urlImagem
    ? 'https://placehold.co/300x300/e5e7eb/9ca3af?text=Sem+imagem'
    : produto.urlImagem

  return (
    <Link
      to={`/produto/${produto.id}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden"
    >
      {/* Mobile: horizontal list layout | sm+: vertical card layout */}
      <div className="flex sm:flex-col">

        {/* Image */}
        <div className="relative w-28 flex-shrink-0 sm:w-full sm:aspect-square overflow-hidden bg-gray-100">
          <img
            src={imgSrc}
            alt={produto.nome}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ minHeight: '7rem' }}
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {desconto > 0 && (
              <Badge variant="danger" size="sm">-{desconto}%</Badge>
            )}
            {produto.destaque && (
              <Badge variant="warning" size="sm">
                <FiTrendingUp className="mr-0.5" size={10} />
                Destaque
              </Badge>
            )}
            {!temEstoque && (
              <Badge variant="dark" size="sm">Esgotado</Badge>
            )}
          </div>

          {/* Favourite button — sm+ only */}
          <button
            onClick={handleToggleFavorite}
            className={`hidden sm:flex absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-md transition-all items-center justify-center ${
              isFavorite ? 'text-red-500 scale-110' : 'text-gray-400 hover:text-red-500 hover:scale-110'
            }`}
          >
            <FiHeart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          {/* Hover overlay — sm+ only */}
          <div className="hidden sm:flex absolute inset-0 bg-primary-600 bg-opacity-0 group-hover:bg-opacity-10 transition-opacity items-center justify-center opacity-0 group-hover:opacity-100">
            <Button variant="white" size="sm" className="shadow-lg">
              <FiEye className="mr-1" size={14} />
              Ver Detalhes
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-2.5 sm:p-3 min-w-0">
          <p className="text-xs text-gray-500 mb-0.5 uppercase tracking-wide truncate">
            {produto.categoriaNome || 'Sem categoria'}
          </p>

          <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 leading-tight">
            {produto.nome}
          </h3>

          {/* Stars — sm+ only */}
          <div className="hidden sm:flex items-center gap-1.5 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  size={12}
                  className={i < (produto.avaliacao || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({produto.numeroAvaliacoes || 0})</span>
          </div>

          {/* Price */}
          <div className="mt-auto">
            {desconto > 0 && precoBase != null && (
              <p className="text-xs text-gray-400 line-through leading-none mb-0.5">
                R$ {precoBase.toFixed(2)}
              </p>
            )}
            <p className="text-base font-bold text-primary-600 leading-tight">
              R$ {precoFinal.toFixed(2)}
            </p>
            {desconto > 0 && precoBase != null && (
              <span className="text-xs text-green-600 font-medium">
                -{desconto}% de desconto
              </span>
            )}
          </div>

          {estoqueMinimo && (
            <p className="text-xs text-orange-600 mt-1 font-medium">
              Últimas {quantidadeEstoque} un.
            </p>
          )}

          <Button
            onClick={handleAddToCart}
            fullWidth
            disabled={!temEstoque}
            variant={isInCart(produto.id) ? 'success' : 'primary'}
            size="sm"
            className="mt-2"
          >
            <FiShoppingCart className="mr-1" size={13} />
            <span className="truncate">
              {!temEstoque ? 'Indisponível' : isInCart(produto.id) ? 'No Carrinho' : 'Adicionar'}
            </span>
          </Button>
        </div>

      </div>
    </Link>
  )
}
