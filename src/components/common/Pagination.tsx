import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps): React.JSX.Element {
  const getPageNumbers = (): (number | string)[] => {
    const delta = 2
    const pages: (number | string)[] = []

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
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <FiChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-2">
          {pages.map((page, index) =>
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="w-9 text-center text-muted-foreground/60 select-none">
                ···
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`
                  w-9 h-9 rounded-lg text-sm font-semibold transition-[background-color,color,transform] duration-150 active:not-disabled:scale-[0.96]
                  ${currentPage === page
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted'
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
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Próxima
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Page indicator */}
      <p className="text-xs text-muted-foreground tracking-wide">
        Página <span className="font-semibold text-muted-foreground">{currentPage}</span> de{' '}
        <span className="font-semibold text-muted-foreground">{totalPages}</span>
      </p>
    </div>
  )
}
