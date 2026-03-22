import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingCart, FiHeart } from 'react-icons/fi'
import Button from './Button'

/**
 * ProductCard Component — redesigned
 */
export default function ProductCard({ product, onAddToCart, onToggleFavorite }) {
  const [imageError, setImageError] = useState(false)
  const [addedFeedback, setAddedFeedback] = useState(false)

  const placeholder = 'https://placehold.co/600x400/f3f4f6/9ca3af?text=Sem+imagem'

  const {
    id,
    nome,
    descricao,
    preco,
    precoPromocional,
    url_imagem,
    estoque,
    categoria,
    novo,
    emPromocao,
  } = product

  const precoFinal = precoPromocional || preco?.valor || preco || 0
  const temDesconto = precoPromocional && preco?.valor
  const disponivel = estoque > 0
  const desconto = temDesconto
    ? Math.round(((preco.valor - precoPromocional) / preco.valor) * 100)
    : null

  const formatarValor = (valor) => {
    if (typeof valor !== 'number' || isNaN(valor)) return 'R$ 0,00'
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!onAddToCart) return
    onAddToCart(product)
    setAddedFeedback(true)
    setTimeout(() => setAddedFeedback(false), 1500)
  }

  const handleToggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onToggleFavorite) onToggleFavorite(product)
  }

  return (
    <Link
      to={`/produto/${id}`}
      className="group flex flex-col bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {novo && (
            <span className="text-xs font-semibold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
              Novo
            </span>
          )}
          {desconto && (
            <span className="text-xs font-semibold bg-red-500 text-white px-2 py-0.5 rounded-full">
              -{desconto}%
            </span>
          )}
          {!disponivel && (
            <span className="text-xs font-semibold bg-gray-400 text-white px-2 py-0.5 rounded-full">
              Esgotado
            </span>
          )}
        </div>

        {/* Favorite */}
        <button
          onClick={handleToggleFavorite}
          aria-label="Favoritar"
          className="absolute top-3 right-3 z-10 p-1.5 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 text-gray-400"
        >
          <FiHeart className="w-4 h-4" />
        </button>

        <img
          src={imageError || !url_imagem ? placeholder : url_imagem}
          alt={nome || 'Produto'}
          onError={() => setImageError(true)}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Category label */}
        {categoria && (
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
            {categoria.nome || categoria}
          </p>
        )}

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors">
          {nome}
        </h3>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Price */}
        <div className="mt-1">
          {temDesconto && (
            <p className="text-xs text-gray-400 line-through">
              {formatarValor(preco.valor)}
            </p>
          )}
          <p className={`text-xl font-bold tracking-tight ${temDesconto ? 'text-red-600' : 'text-gray-900'}`}>
            {formatarValor(precoFinal)}
          </p>
        </div>

        {/* Low stock warning */}
        {disponivel && estoque < 10 && (
          <p className="text-[11px] text-orange-500 font-medium">
            Restam apenas {estoque} {estoque === 1 ? 'unidade' : 'unidades'}
          </p>
        )}

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          disabled={!disponivel}
          className={`
            mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-150
            ${!disponivel
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : addedFeedback
                ? 'bg-emerald-500 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white active:scale-95'
            }
          `}
        >
          <FiShoppingCart className="w-4 h-4" />
          {!disponivel ? 'Indisponível' : addedFeedback ? 'Adicionado!' : 'Adicionar ao carrinho'}
        </button>
      </div>
    </Link>
  )
}
