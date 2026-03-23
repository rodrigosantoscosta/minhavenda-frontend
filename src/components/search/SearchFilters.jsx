import { useState, useEffect } from 'react'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { get } from '../../services/api'
import logger from '../../utils/logger'

/**
 * Componente SearchFilters - Filtros avançados para busca
 * @param {Object} props
 * @param {Object} props.filters - Filtros atuais
 * @param {function} props.onFiltersChange - Callback quando filtros mudam
 * @param {boolean} props.isOpen - Se painel está aberto
 * @param {function} props.onToggle - Callback para alternar painel
 * @param {string} props.className - Classes CSS adicionais
 */
const SearchFilters = ({
  filters = {},
  onFiltersChange,
  isOpen = false,
  onToggle,
  className = ""
}) => {
  const [categorias, setCategorias] = useState([])
  const [isLoadingCategorias, setIsLoadingCategorias] = useState(false)
  const [localFilters, setLocalFilters] = useState({
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
        setCategorias(response || [])
      } catch (error) {
        logger.error('Erro ao carregar categorias', { error: error.message })
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

  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleApplyFilters = () => {
    const cleanedFilters = {}
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

  const handlePrecoChange = (field, value) => {
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

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
        </div>
        <button
          onClick={onToggle}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Fechar filtros"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-6">
        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
          <select
            value={localFilters.categoriaId || ''}
            onChange={(e) => handleFilterChange('categoriaId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md hover:border-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-[border-color,box-shadow] duration-150"
            disabled={isLoadingCategorias}
          >
            <option value="">Todas as categorias</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
            ))}
          </select>
          {isLoadingCategorias && (
            <p className="mt-1 text-xs text-gray-500">Carregando categorias...</p>
          )}
        </div>

        {/* Faixa de Preço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Faixa de Preço</label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Preço Mínimo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="text"
                  value={localFilters.precoMin || ''}
                  onChange={(e) => handlePrecoChange('precoMin', e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md hover:border-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-[border-color,box-shadow] duration-150"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Preço Máximo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                <input
                  type="text"
                  value={localFilters.precoMax || ''}
                  onChange={(e) => handlePrecoChange('precoMax', e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md hover:border-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-[border-color,box-shadow] duration-150"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleApplyFilters}
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-[background-color,transform] duration-150 active:scale-[0.96] font-sans font-medium text-sm"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={handleClearFilters}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Limpar
          </button>
        </div>

        {/* Filtros ativos (resumo) */}
        {Object.entries(localFilters).some(([key, value]) =>
          value !== '' && value !== null && value !== undefined && key !== 'ativo'
        ) && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Filtros ativos:</p>
            <div className="space-y-1">
              {localFilters.categoriaId && (
                <p className="text-xs text-gray-600">
                  Categoria: {categorias.find(c => c.id === parseInt(localFilters.categoriaId))?.nome || 'Selecionada'}
                </p>
              )}
              {localFilters.precoMin && (
                <p className="text-xs text-gray-600">
                  Preço mínimo: R$ {parseFloat(localFilters.precoMin).toFixed(2)}
                </p>
              )}
              {localFilters.precoMax && (
                <p className="text-xs text-gray-600">
                  Preço máximo: R$ {parseFloat(localFilters.precoMax).toFixed(2)}
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
