import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiShoppingCart, FiHeart } from 'react-icons/fi'
import Button from './Button'
import Badge from './Badge'
import { getProductImageUrl, getPlaceholder } from '../../utils/imageHelper'

/**
 * ProductCard - COM DEBUG ATIVO
 * 
 * Use este arquivo para debugar problema de imagens
 */
export default function ProductCard({ product, onAddToCart }) {
  const [imageError, setImageError] = useState(false)

  const imageUrl = imageError 
    ? getPlaceholder()
    : getProductImageUrl(product?.urlImagem)

  // ========================================
  // DEBUG - LOGS DETALHADOS
  // ========================================
  // console.group(`🖼️ ProductCard: ${product?.nome}`)
  // console.log('Produto completo:', product)
  // console.log('URL original do backend:', product?.urlImagem)
  // console.log('URL processada pelo helper:', imageUrl)
  // console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
  // console.log('Tem erro de imagem?', imageError)
  // console.groupEnd()

  const {
    id,
    nome,
    descricao,
    preco,
    precoPromocional,
    estoque,
    quantidadeEstoque,
    categoria,
    categoriaNome,
    novo,
    emPromocao,
  } = product || {}

  const estoqueDisponivel = estoque || quantidadeEstoque || 0
  const precoFinal = precoPromocional || preco?.valor || preco || 0
  const precoOriginal = preco?.valor || preco || 0
  const temDesconto = precoPromocional && precoOriginal > precoPromocional
  const disponivel = estoqueDisponivel > 0

  const formatarValor = (valor) => {
    if (typeof valor !== 'number' || isNaN(valor)) {
      return 'R$ 0,00'
    }
    return `R$ ${valor.toFixed(2)}`
  }

  const calcularDesconto = () => {
    if (!temDesconto) return 0
    return Math.round(((precoOriginal - precoPromocional) / precoOriginal) * 100)
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onAddToCart) {
      onAddToCart(product)
    }
  }

  const handleImageError = (e) => {
    console.error(' ERRO AO CARREGAR IMAGEM:', {
      produtoId: product?.id,
      produtoNome: product?.nome,
      urlOriginal: product?.urlImagem,
      urlProcessada: imageUrl,
      srcAtual: e.target?.src,
      erro: e
    })
    setImageError(true)
  }

  const handleImageLoad = (e) => {
    console.log('IMAGEM CARREGADA COM SUCESSO:', {
      produtoId: product?.id,
      produtoNome: product?.nome,
      url: e.target?.src
    })
  }

  return (
    <Link
      to={`/produto/${id}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
          {novo && <Badge variant="success" size="sm">Novo</Badge>}
          {emPromocao && <Badge variant="danger" size="sm">Promoção</Badge>}
          {!disponivel && <Badge variant="secondary" size="sm">Esgotado</Badge>}
        </div>

        {/* Favorite */}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-2 right-2 z-10 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
        >
          <FiHeart className="w-5 h-5 text-gray-600 hover:text-red-500" />
        </button>

        {/* Image com Debug */}
        <img
          src={imageUrl}
          alt={nome || 'Produto'}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />

        {/* Debug overlay - mostra URL quando em DEV */}
        {import.meta.env.DEV && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2 break-all">
            <div className="font-bold mb-1">🔍 DEBUG:</div>
            <div>Original: {product?.urlImagem|| 'null'}</div>
            <div>Processada: {imageUrl}</div>
            <div>Status: {imageError ? 'Erro' : 'OK'}</div>
          </div>
        )}

        {/* Discount Badge */}
        {temDesconto && calcularDesconto() > 0 && (
          <div className="absolute bottom-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            -{calcularDesconto()}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        
        {/* Category */}
        {(categoria || categoriaNome) && (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {categoria?.nome || categoriaNome}
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
              {formatarValor(precoOriginal)}
            </p>
          )}
          <p className="text-2xl font-bold text-gray-900">
            {formatarValor(precoFinal)}
          </p>
        </div>

        {/* Stock */}
        {disponivel ? (
          estoqueDisponivel < 10 && (
            <p className="text-sm text-orange-600 mb-3">
              Apenas {estoqueDisponivel} disponível
            </p>
          )
        ) : (
          <p className="text-sm text-red-600 mb-3">
            Produto esgotado
          </p>
        )}

        {/* Button */}
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