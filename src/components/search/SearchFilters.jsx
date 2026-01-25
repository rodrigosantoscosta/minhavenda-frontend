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

  // Carregar categorias
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

    if (isOpen) {
      carregarCategorias()
    }
  }, [isOpen])

  // Sincronizar filtros locais com props
  useEffect(() => {
    setLocalFilters(prev => ({
      ...prev,
      ...filters
    }))
  }, [filters])

  /**
   * Handle change dos filtros
   * @param {string} field - Campo do filtro
   * @param {any} value - Novo valor
   */
  const handleFilterChange = (field, value) => {
    const newFilters = {
      ...localFilters,
      [field]: value
    }
    
    setLocalFilters(newFilters)
    
    // Notificar componente pai
    if (onFiltersChange) {
      onFiltersChange(newFilters)
    }
  }

  /**
   * Aplicar filtros
   */
  const handleApplyFilters = () => {
    // Limpar valores vazios
    const cleanedFilters = {}
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        cleanedFilters[key] = value
      }
    })
    
    if (onFiltersChange) {
      onFiltersChange(cleanedFilters)
    }
  }

  /**
   * Limpar todos os filtros
   */
  const handleClearFilters = () => {
    const clearedFilters = {
      categoriaId: '',
      precoMin: '',
      precoMax: '',
      ativo: true
    }
    
    setLocalFilters(clearedFilters)
    
    if (onFiltersChange) {
      onFiltersChange(clearedFilters)
    }
  }

  /**
   * Handle change de preço (validação)
   * @param {string} field - Campo (precoMin ou precoMax)
   * @param {string} value - Valor do input
   */
  const handlePrecoChange = (field, value) => {
    // Permitir apenas números e ponto decimal
    const numericValue = value.replace(/[^0-9.]/g, '')
    
    // Validar que tem apenas um ponto decimal
    const parts = numericValue.split('.')
    if (parts.length > 2) {
      return
    }
    
    // Limitar casas decimais
    if (parts[1] && parts[1].length > 2) {
      return
    }
    
    handleFilterChange(field, numericValue)
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header do painel de filtros */}
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

      {/* Conteúdo dos filtros */}
      <div className="p-4 space-y-6">
        {/* Filtro de Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <select
            value={localFilters.categoriaId || ''}
            onChange={(e) => handleFilterChange('categoriaId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoadingCategorias}
          >
            <option value="">Todas as categorias</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
          {isLoadingCategorias && (
            <p className="mt-1 text-xs text-gray-500">Carregando categorias...</p>
          )}
        </div>

        {/* Filtro de Preço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Faixa de Preço
          </label>
          
          <div className="space-y-3">
            {/* Preço Mínimo */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Preço Mínimo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <input
                  type="text"
                  value={localFilters.precoMin || ''}
                  onChange={(e) => handlePrecoChange('precoMin', e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Preço Máximo */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Preço Máximo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <input
                  type="text"
                  value={localFilters.precoMax || ''}
                  onChange={(e) => handlePrecoChange('precoMax', e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filtro de Status (se for admin) */}
        {false && ( // Desabilitado por enquanto - só para admin
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status do Produto
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="ativo"
                  value="true"
                  checked={localFilters.ativo === true}
                  onChange={() => handleFilterChange('ativo', true)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Ativos</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="ativo"
                  value="false"
                  checked={localFilters.ativo === false}
                  onChange={() => handleFilterChange('ativo', false)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Inativos</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="ativo"
                  value=""
                  checked={localFilters.ativo === undefined || localFilters.ativo === ''}
                  onChange={() => handleFilterChange('ativo', undefined)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Todos</span>
              </label>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleApplyFilters}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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