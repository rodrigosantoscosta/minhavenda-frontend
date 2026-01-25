import ProductCard from '../common/products/ProductCard'
import ProductCardSkeleton from './ProductCardSkeleton'

export default function ProductsGrid({ 
  produtos = [], 
  onAddToCart, 
  loading = false,
  columns = 3,
  viewMode = 'grid'
}) {
  
  if (loading) {
    return (
      <div className={`grid gap-6 ${
        columns === 4 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {[...Array(columns * 2)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div className={`grid gap-6 ${
      columns === 4 
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
    }`}>
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
