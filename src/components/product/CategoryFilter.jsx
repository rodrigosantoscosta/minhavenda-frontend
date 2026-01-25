export default function CategoryFilter({ 
  categorias = [], 
  selectedCategory, 
  onCategoryChange 
}) {
  if (categorias.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {/* Botão "Todas" */}
      <button
        onClick={() => onCategoryChange(null)}
        className={`
          px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all
          ${!selectedCategory
            ? 'bg-primary-600 text-white shadow-md'
            : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-300 hover:bg-primary-50'
          }
        `}
      >
        Todas
      </button>

      {/* Botões de Categorias */}
      {categorias.map(categoria => (
        <button
          key={categoria.id}
          onClick={() => onCategoryChange(categoria.id)}
          className={`
            px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all
            ${selectedCategory === categoria.id
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-primary-300 hover:bg-primary-50'
            }
          `}
        >
          {categoria.nome}
          {categoria.totalProdutos > 0 && (
            <span className={`
              ml-2 text-xs
              ${selectedCategory === categoria.id ? 'text-primary-100' : 'text-gray-500'}
            `}>
              ({categoria.totalProdutos})
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
