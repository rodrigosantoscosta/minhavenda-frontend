import { FiGrid, FiMonitor, FiShoppingBag , FiBook, FiHome, FiWatch, FiHeadphones, FiCamera } from 'react-icons/fi'

// Mapa de ícones para categorias
const categoryIcons = {
  'eletrônicos': FiMonitor,
  'livros': FiBook,
  'casa': FiHome,
  'acessórios': FiWatch,
  'áudio': FiHeadphones,
  'fotografia': FiCamera,
  'default': FiGrid
}

export default function FeaturedCategories({ 
  categorias = [], 
  onCategorySelect,
  selectedCategory 
}) {
  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || ''
    const Icon = categoryIcons[name] || categoryIcons.default
    return Icon
  }

  if (categorias.length === 0) {
    return null
  }

  // Mostrar no máximo 8 categorias
  const featuredCategorias = categorias.slice(0, 8)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
      {featuredCategorias.map(categoria => {
        const Icon = getCategoryIcon(categoria.nome)
        const isSelected = selectedCategory === categoria.id

        return (
          <button
            key={categoria.id}
            onClick={() => onCategorySelect(isSelected ? null : categoria.id)}
            className={`
              group flex flex-col items-center p-6 rounded-xl transition-all duration-300
              ${isSelected
                ? 'bg-primary-600 text-white shadow-lg scale-105'
                : 'bg-white hover:bg-primary-50 border border-gray-200 hover:border-primary-300 hover:shadow-md'
              }
            `}
          >
            <div className={`
              p-4 rounded-full mb-3 transition-colors
              ${isSelected
                ? 'bg-white bg-opacity-20'
                : 'bg-primary-100 group-hover:bg-primary-200'
              }
            `}>
              <Icon 
                size={24} 
                className={isSelected ? 'text-white' : 'text-primary-600'}
              />
            </div>
            <span className={`
              text-sm font-medium text-center transition-colors
              ${isSelected ? 'text-white' : 'text-gray-700 group-hover:text-primary-600'}
            `}>
              {categoria.nome}
            </span>
            {categoria.totalProdutos > 0 && (
              <span className={`
                text-xs mt-1 transition-colors
                ${isSelected ? 'text-primary-100' : 'text-gray-500'}
              `}>
                {categoria.totalProdutos} {categoria.totalProdutos === 1 ? 'produto' : 'produtos'}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
