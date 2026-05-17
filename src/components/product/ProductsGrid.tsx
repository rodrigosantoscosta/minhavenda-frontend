import ProductCard from '../common/products/ProductCard'
import type { Product } from '../../types'
import ProductCardSkeleton from './ProductCardSkeleton'

interface ProductsGridProps {
  produtos?: Product[]
  onAddToCart?: (produto: Product) => void
  loading?: boolean
  columns?: number
  viewMode?: 'grid' | 'list'
  className?: string
}

export default function ProductsGrid({ 
  produtos = [], 
  onAddToCart: _onAddToCart, 
  loading = false,
  columns = 4,
  viewMode: _viewMode = 'grid',
  className: _className = '',
}: ProductsGridProps) {
  const gridClass = columns === 4
    ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
    : columns === 2
    ? 'grid-cols-1 sm:grid-cols-2'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  if (loading) {
    return (
      <div className={`grid gap-3 sm:gap-4 ${gridClass}`}>
        {[...Array(columns * 2)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={`grid gap-3 sm:gap-4 ${gridClass}`}>
      {produtos.map(produto => (
        <ProductCard
          key={produto.id}
          produto={produto}
          viewMode={_viewMode}
        />
      ))}
    </div>
  )
}
