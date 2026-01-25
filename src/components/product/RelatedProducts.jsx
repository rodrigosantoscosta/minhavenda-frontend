import { Link } from 'react-router-dom'
import ProductCard from '../common/ProductCard' 
import { FiChevronRight } from 'react-icons/fi'

export default function RelatedProducts({ produtos = [] }) {
  if (produtos.length === 0) return null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Produtos Relacionados
        </h2>
        <Link 
          to="/produtos" 
          className="flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          Ver mais
          <FiChevronRight className="ml-1" size={20} />
        </Link>
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {produtos.map(produto => (
          <ProductCard
            key={produto.id}
            produto={produto}
          />
        ))}
      </div>
    </div>
  )
}
