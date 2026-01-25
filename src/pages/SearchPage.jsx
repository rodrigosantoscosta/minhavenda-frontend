import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'


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
  
  // Estado dos dados
  const [produtos, setProdutos] = useState([])
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true
  })
  
  // Estado da UI
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  
  // Parsear parâmetros da URL
  const getParamsFromURL = useCallback(() => {
    return searchService.parsearParamsBusca(searchParams)
  }, [searchParams])
  
  // Atualizar URL com novos parâmetros
  const updateURL = useCallback((newParams) => {
    const params = new URLSearchParams()
    
    // Adicionar apenas parâmetros não vazios
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'nome:asc') {
        params.append(key, value.toString())
      }
    })
    
    // Manter o termo de busca (q ou termo)
    const searchTerm = newParams.termo || newParams.q
    if (searchTerm) {
      params.set('q', searchTerm)
    }
    
    // Remover duplicados e ordenar
    const orderedParams = new URLSearchParams()
    const priorityOrder = ['q', 'termo', 'categoriaId', 'precoMin', 'precoMax', 'sort', 'page', 'size']
    
    priorityOrder.forEach(key => {
      if (params.has(key)) {
        orderedParams.set(key, params.get(key))
      }
    })
    
    // Adicionar outros parâmetros
    params.forEach((value, key) => {
      if (!orderedParams.has(key)) {
        orderedParams.set(key, value)
      }
    })
    
    setSearchParams(orderedParams)
  }, [setSearchParams])
  
  // Buscar produtos
  const buscarProdutos = useCallback(async (params) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Validar parâmetros
      const validation = searchService.validarParamsBusca(params)
      if (!validation.isValid) {
        logger.warn({ errors: validation.errors }, 'Parâmetros de busca inválidos')
        // Não mostra erro de validação para usuário, apenas ignora valores inválidos
      }
      
      let response
      
      // Se tem termo de busca, usa endpoint de busca
      if (params.termo || params.q) {
        const searchTerm = params.termo || params.q
        const options = {
          page: params.page,
          size: params.size,
          sort: params.sort
        }
        response = await searchService.buscarPorTermo(searchTerm, options)
      } else {
        // Senão, usa endpoint de filtros avançados
        response = await searchService.buscarProdutos(params)
      }
      
      // Atualizar estado
      setProdutos(response.content || [])
      setPagination({
        page: response.number || 0,
        size: response.size || 20,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0,
        first: response.first || true,
        last: response.last || true
      })
      
      logger.info({ 
        totalProdutos: response.totalElements,
        pagina: response.number,
        termo: params.termo || params.q
      }, 'Busca concluída com sucesso')
      
    } catch (err) {
      logger.error({ error: err, params }, 'Erro ao buscar produtos')
      setError(err.message || 'Erro ao carregar produtos')
      setProdutos([])
      setPagination({
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true
      })
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // Handle mudança de busca
  const handleSearch = useCallback((termo) => {
    const newParams = {
      ...getParamsFromURL(),
      termo,
      page: 0 // Resetar página ao buscar
    }
    updateURL(newParams)
  }, [getParamsFromURL, updateURL])
  
  // Handle mudança de filtros
  const handleFiltersChange = useCallback((filters) => {
    const newParams = {
      ...getParamsFromURL(),
      ...filters,
      page: 0 // Resetar página ao filtrar
    }
    updateURL(newParams)
  }, [getParamsFromURL, updateURL])
  
  // Handle mudança de ordenação
  const handleSortChange = useCallback((sort) => {
    const newParams = {
      ...getParamsFromURL(),
      sort,
      page: 0 // Resetar página ao ordenar
    }
    updateURL(newParams)
  }, [getParamsFromURL, updateURL])
  
  // Handle mudança de página
  const handlePageChange = useCallback((newPage) => {
    const newParams = {
      ...getParamsFromURL(),
      page: newPage
    }
    updateURL(newParams)
  }, [getParamsFromURL, updateURL])
  
  // Efeito principal: buscar produtos quando parâmetros mudam
  useEffect(() => {
    const params = getParamsFromURL()
    buscarProdutos(params)
  }, [getParamsFromURL, buscarProdutos])
  
  // Obter parâmetros atuais
  const currentParams = getParamsFromURL()
  const searchTerm = currentParams.termo || currentParams.q || ''
  
  // Renderizar estado vazio
  if (!isLoading && produtos.length === 0 && !error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {searchTerm ? `Resultados para "${searchTerm}"` : 'Buscar Produtos'}
            </h1>
          </div>
          
          {/* Estado vazio */}
          <EmptyState
            title="Nenhum produto encontrado"
            description={searchTerm 
              ? `Não encontramos resultados para "${searchTerm}". Use a barra de busca no header para tentar outros termos.`
              : "Use a barra de busca no header para encontrar produtos."
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {searchTerm ? `Resultados para "${searchTerm}"` : 'Buscar Produtos'}
          </h1>
          
          {/* Controles (filtros e ordenação) */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Info de resultados */}
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-600">
                {pagination.totalElements > 0 
                  ? `${pagination.totalElements} produto${pagination.totalElements !== 1 ? 's' : ''} encontrado${pagination.totalElements !== 1 ? 's' : ''}`
                  : 'Nenhum produto encontrado'
                }
              </p>
              
              {/* Botão de filtros (mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <FunnelIcon className="h-4 w-4" />
                <span className="text-sm">Filtros</span>
              </button>
            </div>
            
            {/* Ordenação */}
            <div className="w-full lg:w-auto">
              <SortOptions
                value={currentParams.sort || 'nome:asc'}
                onChange={handleSortChange}
                showLabel={false}
                className="w-full lg:w-auto"
              />
            </div>
          </div>
        </div>
        
        {/* Conteúdo principal */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Painel de filtros */}
          <div className={`
            ${showFilters ? 'block' : 'hidden'}
            lg:block lg:w-80 lg:flex-shrink-0
          `}>
            <SearchFilters
              filters={currentParams}
              onFiltersChange={handleFiltersChange}
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
            />
          </div>
          
          {/* Lista de produtos */}
          <div className="flex-1">
            {isLoading ? (
              <div className="py-12">
                <Loading message="Buscando produtos..." />
              </div>
            ) : error ? (
              <div className="py-12">
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
                {/* Grid de produtos */}
                <ProductsGrid 
                  produtos={produtos}
                  loading={isLoading}
                  className="mb-8"
                />
                
                {/* Paginação */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      onPageChange={handlePageChange}
                      className="mt-8"
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