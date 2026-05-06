import { useState, useEffect } from 'react'
import type { Category } from '../../types'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { get } from '../../services/api'
import logger from '../../utils/logger'

interface SearchFiltersProps {
  filters?: Record<string, unknown>
  onFiltersChange?: (filters: Record<string, unknown>) => void
  isOpen?: boolean
  onToggle?: () => void
  className?: string
}

const SearchFilters = ({
  filters = {},
  onFiltersChange,
  isOpen: _isOpen = false,
  onToggle: _onToggleFilter,
  className = ''
}: SearchFiltersProps) => {
  const [categorias, setCategorias] = useState<Category[]>([])
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(false)
  const [localFilters, setLocalFilters] = useState<Record<string, unknown>>({
    categoriaId: '',
    precoMin: '',
    precoMax: '',
    ativo: true,
    ...filters
  })

  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        setIsLoadingCategorias(true)
        const response = await get('/categorias')
        setCategorias((response as Category[]) || [])
      } catch (error) {
        logger.error({ error: (error as Error).message }, 'Erro ao carregar categorias')
        setCategorias([])
      } finally {
        setIsLoadingCategorias(false)
      }
    }
    carregarCategorias()
  }, [])

  useEffect(() => {
    setLocalFilters(prev => ({ ...prev, ...filters }))
  }, [filters])

  const handleFilterChange = (field: string, value: unknown) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleApplyFilters = () => {
    const cleanedFilters: Record<string, unknown> = {}
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        cleanedFilters[key] = value
      }
    })
    if (onFiltersChange) onFiltersChange(cleanedFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters = { categoriaId: '', precoMin: '', precoMax: '', ativo: true }
    setLocalFilters(clearedFilters)
    if (onFiltersChange) onFiltersChange(clearedFilters)
  }

  const handlePrecoChange = (field: string, value: string) => {
    let numericValue = value.replace(/[^0-9.,]/g, '')
    if (numericValue.includes(',')) {
      const lastCommaIndex = numericValue.lastIndexOf(',')
      const lastDotIndex = numericValue.lastIndexOf('.')
      if (lastCommaIndex > lastDotIndex) {
        numericValue = numericValue.replace(/\./g, '').replace(',', '.')
      } else {
        numericValue = numericValue.replace(/\./g, '')
      }
    }
    const parts = numericValue.split('.')
    if (parts.length > 2) return
    if (parts[1] && parts[1].length > 2) return
    handleFilterChange(field, numericValue)
  }

  const inputClass =
    'w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground ' +
    'hover:border-ring/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ' +
    'transition-[border-color,box-shadow] duration-150 font-sans text-sm'

  const hasActiveFilters = Object.entries(localFilters).some(
    ([key, value]) => value !== '' && value !== null && value !== undefined && key !== 'ativo'
  )

  return (
    <div className={`bg-card rounded-lg border border-border ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-display font-semibold text-foreground text-base">Filtros</h3>
        </div>
        <button
          onClick={_onToggleFilter}
          className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
          aria-label="Fechar filtros"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">

        {/* Categoria */}
        <div>
          <label className="block text-sm font-sans font-medium text-foreground mb-2">
            Categoria
          </label>
          <select
            value={(localFilters.categoriaId as string) || ''}
            onChange={(e) => handleFilterChange('categoriaId', e.target.value)}
            className={inputClass}
            disabled={isLoadingCategorias}
          >
            <option value="">Todas as categorias</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
            ))}
          </select>
          {isLoadingCategorias && (
            <p className="mt-1 text-xs text-muted-foreground font-sans">Carregando categorias...</p>
          )}
        </div>

        {/* Faixa de Preço */}
        <div>
          <label className="block text-sm font-sans font-medium text-foreground mb-2">
            Faixa de Preço
          </label>
          <div className="space-y-3">
            {[
              { field: 'precoMin', label: 'Preço Mínimo' },
              { field: 'precoMax', label: 'Preço Máximo' },
            ].map(({ field, label }) => (
              <div key={field}>
                <label className="block text-xs text-muted-foreground font-sans mb-1">{label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-sans">
                    R$
                  </span>
                  <input
                    type="text"
                    value={(localFilters[field] as string) || ''}
                    onChange={(e) => handlePrecoChange(field, e.target.value)}
                    placeholder="0,00"
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            onClick={handleApplyFilters}
            className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg
              hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring/50
              transition-[background-color,transform] duration-150 active:scale-[0.96]
              font-sans font-medium text-sm"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={handleClearFilters}
            className="flex-1 bg-muted text-muted-foreground py-2 px-4 rounded-lg
              hover:bg-muted/70 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30
              transition-colors duration-150 font-sans text-sm"
          >
            Limpar
          </button>
        </div>

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-display font-semibold text-foreground uppercase tracking-wider mb-2">
              Filtros ativos
            </p>
            <div className="space-y-1">
              {!!localFilters.categoriaId && (
                <p className="text-xs text-muted-foreground font-sans">
                  Categoria: {categorias.find(c => c.id === parseInt(localFilters.categoriaId as string))?.nome || 'Selecionada'}
                </p>
              )}
              {!!localFilters.precoMin && (
                <p className="text-xs text-muted-foreground font-sans">
                  Preço mín: R$ {parseFloat(localFilters.precoMin as string).toFixed(2)}
                </p>
              )}
              {!!localFilters.precoMax && (
                <p className="text-xs text-muted-foreground font-sans">
                  Preço máx: R$ {parseFloat(localFilters.precoMax as string).toFixed(2)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchFilters
