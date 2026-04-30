/**
 * CategoryFilter — horizontal scroll pills with fade hint and active lift.
 * Skill: specific transition properties, shadows-as-borders, scale on press.
 */
import type { Category } from '../../types'

interface CategoryFilterProps {
  categorias?: Category[]
  selectedCategory?: string | number | null
  onCategoryChange: (id: string | number | null) => void
}

export default function CategoryFilter({
  categorias = [],
  selectedCategory,
  onCategoryChange
}: CategoryFilterProps) {
  if (categorias.length === 0) return null

  const pillBase = [
    'px-4 py-1.5 rounded-full font-sans font-medium text-sm whitespace-nowrap',
    'transition-[background-color,color,box-shadow,transform] duration-150',
    'active:scale-[0.96]',
    'focus:outline-none focus:ring-2 focus:ring-primary-500/40',
  ].join(' ')

  const pillActive   = 'bg-primary-600 text-white shadow-card'
  const pillInactive = 'bg-white text-gray-600 shadow-card hover:shadow-card-hover hover:text-gray-900'

  return (
    // Skill: right-side fade hint via mask-image to signal overflow
    <div
      className="relative"
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 2%, black 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 2%, black 90%, transparent 100%)',
      }}
    >
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide px-2">
        {/* "Todas" pill */}
        <button
          onClick={() => onCategoryChange(null)}
          className={`${pillBase} ${!selectedCategory ? pillActive : pillInactive}`}
        >
          Todas
        </button>

        {/* Category pills */}
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`${pillBase} ${selectedCategory === cat.id ? pillActive : pillInactive}`}
          >
            {cat.nome}
            {cat.totalProdutos > 0 && (
              <span className={`ml-1.5 text-[11px] tabular-nums ${
                selectedCategory === cat.id ? 'opacity-70' : 'text-gray-400'
              }`}>
                {cat.totalProdutos}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
