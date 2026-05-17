/**
 * CategoryNav — horizontal scrollable category pills with fade edges.
 * Used as the primary category navigation below the header on the home page.
 */
import type { Category } from '../../types'

interface CategoryNavProps {
  categorias?: Category[]
  selectedCategory: string | number | null
  onCategoryChange: (id: string | number | null) => void
}

export default function CategoryNav({
  categorias = [],
  selectedCategory,
  onCategoryChange
}: CategoryNavProps) {
  if (categorias.length === 0) return null

  return (
    <div className="flex items-center gap-6 overflow-x-auto pb-1 scrollbar-hide">
      <button
        onClick={() => onCategoryChange(null)}
        className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
          !selectedCategory
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Todos
      </button>

      {categorias.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
          className={`text-sm font-medium whitespace-nowrap transition-colors duration-150 ${
            selectedCategory === cat.id
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {cat.nome}
        </button>
      ))}
    </div>
  )
}
