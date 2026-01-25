// src/components/common/Pagination.jsx - PAGINAÇÃO
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const delta = 2 // Páginas para mostrar antes e depois da atual
    const pages = []
    
    // Sempre mostrar primeira página
    pages.push(1)
    
    // Calcular range de páginas para mostrar
    const rangeStart = Math.max(2, currentPage - delta)
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta)
    
    // Adicionar "..." se necessário após a primeira página
    if (rangeStart > 2) {
      pages.push('...')
    }
    
    // Adicionar páginas do range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }
    
    // Adicionar "..." se necessário antes da última página
    if (rangeEnd < totalPages - 1) {
      pages.push('...')
    }
    
    // Sempre mostrar última página (se houver mais de 1)
    if (totalPages > 1) {
      pages.push(totalPages)
    }
    
    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Primeira Página */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        aria-label="Primeira página"
      >
        <FiChevronsLeft size={20} />
      </button>

      {/* Página Anterior */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        aria-label="Página anterior"
      >
        <FiChevronLeft size={20} />
      </button>

      {/* Números das Páginas */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                ...
              </span>
            )
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                min-w-[40px] px-3 py-2 rounded-md font-medium transition-colors
                ${currentPage === page
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              {page}
            </button>
          )
        })}
      </div>

      {/* Próxima Página */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        aria-label="Próxima página"
      >
        <FiChevronRight size={20} />
      </button>

      {/* Última Página */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        aria-label="Última página"
      >
        <FiChevronsRight size={20} />
      </button>

      {/* Info da Página */}
      <span className="ml-4 text-sm text-gray-600 whitespace-nowrap">
        Página {currentPage} de {totalPages}
      </span>
    </div>
  )
}
