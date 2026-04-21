import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { FiFilter } from 'react-icons/fi'

import SearchFilters from '../components/search/SearchFilters'
import SortOptions from '../components/search/SortOptions'
import ProductsGrid from '../components/product/ProductsGrid'
import Pagination from '../components/common/Pagination'
import EmptyState from '../components/common/EmptyState'
import Loading from '../components/common/Loading'

import searchService from '../services/searchService'
import logger from '../utils/logger'

/**
 * Página de busca de produtos
 * Gerencia busca, filtros, ordenação e paginação via query params
 */
const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const [produtos, setProdutos] = useState([])
  const [pagination, setPagination] = useState({
    page: 0,
    size: 24,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const getParamsFromURL = useCallback(() => {
    return searchService.parsearParamsBusca(searchParams)
  }, [searchParams])

  const updateURL = useCallback((newParams) => {
    setSearchParams(searchService.toURLSearchParams(newParams))
  }, [setSearchParams])

  const buscarProdutos = useCallback(async (params) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await searchService.buscarProdutos(params)

      if (response?.content !== undefined) {
        setProdutos(response.content || [])
        setPagination({
          page: response.number ?? 0,
          size: response.size ?? 24,
          totalElements: response.totalElements ?? 0,
          totalPages: response.totalPages ?? 0,
          first: response.first ?? true,
          last: response.last ?? true,
        })
      } else if (Array.isArray(response)) {
        setProdutos(response)
        setPagination({ page: 0, size: 24, totalElements: response.length, totalPages: 1, first: true, last: true })
      } else {
        setProdutos([])
      }

      logger.info({ totalProdutos: response?.totalElements, termo: params.termo }, 'Busca concluída')
    } catch (err) {
      logger.error({ error: err, params }, 'Erro ao buscar produtos')
      setError(err.message || 'Erro ao carregar produtos')
      setProdutos([])
      setPagination({ page: 0, size: 24, totalElements: 0, totalPages: 0, first: true, last: true })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleFiltersChange = useCallback((filters) => {
    updateURL({ ...getParamsFromURL(), ...filters, page: 0 })
  }, [getParamsFromURL, updateURL])

  const handleSortChange = useCallback((sort) => {
    updateURL({ ...getParamsFromURL(), sort, page: 0 })
  }, [getParamsFromURL, updateURL])

  const handlePageChange = useCallback((newPage) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    updateURL({ ...getParamsFromURL(), page: newPage - 1 })
  }, [getParamsFromURL, updateURL])

  useEffect(() => {
    const params = getParamsFromURL()
    buscarProdutos(params)
  }, [searchParams])

  const currentParams = getParamsFromURL()
  const searchTerm = currentParams.termo || ''

  if (!isLoading && produtos.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {searchTerm ? `Resultados para "${searchTerm}"` : 'Buscar Produtos'}
            </h1>
            <p className="text-gray-600">0 produtos encontrados</p>
          </div>
          <EmptyState
            title="Nenhum produto encontrado"
            description={
              searchTerm
                ? `Não encontramos resultados para "${searchTerm}". Use a barra de busca no header para tentar outros termos.`
                : 'Use a barra de busca no header para encontrar produtos.'
            }
            icon={<MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />}
            actionLabel="Limpar busca"
            onAction={() => navigate('/busca')}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {searchTerm ? `Resultados para "${searchTerm}"` : 'Buscar Produtos'}
          </h1>
          <p className="text-gray-600">
            {pagination.totalElements > 0
              ? `${pagination.totalElements} produto${pagination.totalElements !== 1 ? 's' : ''} encontrado${pagination.totalElements !== 1 ? 's' : ''}`
              : '\u00a0'}
          </p>
        </div>

        {/* Botão filtros — mobile apenas */}
        <div className="mb-4 lg:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
          >
            <FiFilter size={16} />
            Filtros
          </button>
        </div>

        {/* Layout: sidebar + grid */}
        <div className="flex gap-8 items-start">

          {/* Sidebar */}
          <aside className={`w-64 flex-shrink-0 lg:block ${showFilters ? 'block' : 'hidden'}`}>
            {/* Ordenação */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
              <SortOptions
                value={currentParams.sort || 'nome:asc'}
                onChange={handleSortChange}
                showLabel={true}
                className="w-full"
              />
            </div>

            {/* Filtros */}
            <SearchFilters
              filters={currentParams}
              onFiltersChange={handleFiltersChange}
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
            />
          </aside>

          {/* Conteúdo */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="py-16">
                <Loading message="Buscando produtos..." />
              </div>
            ) : error ? (
              <div className="py-16">
                <EmptyState
                  title="Erro na busca"
                  description={error}
                  icon={<MagnifyingGlassIcon className="h-12 w-12 text-red-400" />}
                  actionLabel="Tentar novamente"
                  onAction={() => buscarProdutos(currentParams)}
                />
              </div>
            ) : (
              <>
                <ProductsGrid
                  produtos={produtos}
                  loading={isLoading}
                  className="mb-8"
                />

                {pagination.totalPages > 1 && (
                  <div className="mt-12">
                    <Pagination
                      currentPage={pagination.page + 1}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default SearchPage
