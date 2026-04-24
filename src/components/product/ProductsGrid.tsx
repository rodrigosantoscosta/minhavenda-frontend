import ProductCard from '../common/products/ProductCard'
import ProductCardSkeleton from './ProductCardSkeleton'

export default function ProductsGrid({ 
  produtos = [], 
  onAddToCart: _onAddToCart, 
  loading = false,
  columns = 3,
  viewMode = 'grid'
}) {
  const gridClass = columns === 4
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'

  if (loading) {
    return (
      <div className={`grid gap-3 sm:gap-5 ${gridClass}`}>
        {[...Array(columns * 2)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={`grid gap-3 sm:gap-5 ${gridClass}`}>
      {produtos.map(produto => (
        <ProductCard
          key={produto.id}
          produto={produto}
          viewMode={viewMode}
        />
      ))}
    </div>
  )
}
