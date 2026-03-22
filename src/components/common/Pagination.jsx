import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const delta = 2
    const pages = []

    pages.push(1)

    const rangeStart = Math.max(2, currentPage - delta)
    const rangeEnd = Math.min(totalPages - 1, currentPage + delta)

    if (rangeStart > 2) pages.push('...')
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i)
    if (rangeEnd < totalPages - 1) pages.push('...')
    if (totalPages > 1) pages.push(totalPages)

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <FiChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-2">
          {pages.map((page, index) =>
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="w-9 text-center text-gray-400 select-none">
                ···
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`
                  w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-150
                  ${currentPage === page
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Próxima página"
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Próxima
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Page indicator */}
      <p className="text-xs text-gray-400 tracking-wide">
        Página <span className="font-semibold text-gray-600">{currentPage}</span> de{' '}
        <span className="font-semibold text-gray-600">{totalPages}</span>
      </p>
    </div>
  )
}
