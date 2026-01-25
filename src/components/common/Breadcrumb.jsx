import { Link } from 'react-router-dom'
import { FiChevronRight, FiHome } from 'react-icons/fi'

export default function Breadcrumb({ items = [] }) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const isFirst = index === 0

        return (
          <div key={index} className="flex items-center">
            {/* Separador (não mostrar antes do primeiro) */}
            {!isFirst && (
              <FiChevronRight className="text-gray-400 mx-2" size={16} />
            )}

            {/* Link ou Texto */}
            {isLast ? (
              // Último item - apenas texto (página atual)
              <span className="text-gray-900 font-medium line-clamp-1">
                {item.label}
              </span>
            ) : (
              // Link clicável
              <Link
                to={item.path}
                className="text-gray-600 hover:text-primary-600 transition-colors line-clamp-1"
              >
                {isFirst && item.label === 'Home' ? (
                  <FiHome size={16} />
                ) : (
                  item.label
                )}
              </Link>
            )}
          </div>
        )
      })}
    </nav>
  )
}
