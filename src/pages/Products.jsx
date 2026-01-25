// src/pages/Products.jsx - COM DEBUG E TRATAMENTO CORRETO
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../components/common/Toast'
import productService from '../services/productService'
import ProductsGrid from '../components/product/ProductsGrid'
import Pagination from '../components/common/Pagination'
import Loading from '../components/common/Loading'
import EmptyState from '../components/common/EmptyState'
import Button from '../components/common/Button'
import logger from '../utils/logger'
import { 
  FiSearch, 
  FiX, 
  FiFilter,
  FiShoppingBag,
} from 'react-icons/fi'

export default function Products() {
  const { addItem } = useCart()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  // Estados de dados
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Paginação
  const [page, setPage] = useState(0) // Backend usa 0-indexed
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 12

  // Filtros
  const [searchTerm, setSearchTerm] = useState(searchParams.get('busca') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoriaId') || null)
  const [minPrice, setMinPrice] = useState(searchParams.get('precoMin') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('precoMax') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('ordem') || 'recentes')

  // UI
  const [showFilters, setShowFilters] = useState(false)

  // Carregar categorias
  useEffect(() => {
    loadCategorias()
  }, [])

  // Carregar produtos quando filtros mudarem
  useEffect(() => {
    loadProdutos()
  }, [page, searchTerm, selectedCategory, minPrice, maxPrice, sortBy])

  // Atualizar URL
  useEffect(() => {
    const params = {}
    if (searchTerm) params.busca = searchTerm
    if (selectedCategory) params.categoriaId = selectedCategory
    if (minPrice) params.precoMin = minPrice
    if (maxPrice) params.precoMax = maxPrice
    if (sortBy && sortBy !== 'recentes') params.ordem = sortBy
    
    setSearchParams(params)
  }, [searchTerm, selectedCategory, minPrice, maxPrice, sortBy])

  const loadCategorias = async () => {
    try {
      logger.info('Buscando categorias')
      const data = await productService.getCategorias()
      logger.info('Categorias recebidas', { categoriaCount: Array.isArray(data) ? data.length : 0 })
      
      if (Array.isArray(data)) {
        setCategorias(data)
      } else {
        logger.warn('Categorias não é array', { dataType: typeof data })
        setCategorias([])
      }
    } catch (error) {
      logger.error('Erro ao carregar categorias', { error: error.message })
      toast.error('Erro ao carregar categorias')
    }
  }

  const loadProdutos = async () => {
    try {
      if (page === 0) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const params = {
        page: page,
        size: pageSize,
        ativo: true,
      }

      if (searchTerm) params.nome = searchTerm
      if (selectedCategory) params.categoriaId = selectedCategory
      if (minPrice) params.precoMin = parseFloat(minPrice)
      if (maxPrice) params.precoMax = parseFloat(maxPrice)

      // Ordenação
      const sortMapping = {
        'recentes': 'dataCriacao,desc',
        'preco_asc': 'preco.valor,asc',
        'preco_desc': 'preco.valor,desc',
        'nome_asc': 'nome,asc',
        'nome_desc': 'nome,desc',
      }
      params.sort = sortMapping[sortBy] || 'dataCriacao,desc'

      logger.info('Buscando produtos com parametros', { page, sortBy })
      const data = await productService.getProdutos(params)
      logger.debug('Resposta do backend recebida', { hasContent: !!data?.content, isArray: Array.isArray(data) })

      // TRATAMENTO CORRETO DOS DADOS
      let produtosArray = []
      
      // Resposta paginada (Spring Page)
      if (data && data.content && Array.isArray(data.content)) {
        logger.debug('Formato: resposta paginada Spring Page')
        produtosArray = data.content
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      }
      // Array direto
      else if (Array.isArray(data)) {
        logger.debug('Formato: array direto')
        produtosArray = data
        setTotalPages(1)
        setTotalElements(data.length)
      }
      // Objeto com produtos
      else if (data && data.produtos && Array.isArray(data.produtos)) {
        logger.debug('Formato: objeto com propriedade produtos')
        produtosArray = data.produtos
        setTotalPages(data.totalPages || 1)
        setTotalElements(data.total || data.produtos.length)
      }
      else {
        logger.warn('Formato de resposta desconhecido', { dataType: typeof data })
        produtosArray = []
      }

      logger.info('Produtos processados com sucesso', { count: produtosArray.length, page, totalPages })
      setProdutos(produtosArray)
      
    } catch (error) {
      logger.error('Erro ao carregar produtos', { error: error.message, status: error.response?.status })
      toast.error('Erro ao carregar produtos')
      setProdutos([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    setPage(0)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategory(null)
    setMinPrice('')
    setMaxPrice('')
    setSortBy('recentes')
    setPage(0)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage - 1) // Converter para 0-indexed
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeFiltersCount = [
    searchTerm,
    selectedCategory,
    minPrice,
    maxPrice,
  ].filter(Boolean).length

  if (loading && page === 0) {
    return <Loading />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Produtos
          </h1>
          <p className="text-gray-600">
            {totalElements} {totalElements === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
        </div>

        {/* Barra de Busca */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setPage(0)
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={20} />
                </button>
              )}
            </div>
            <Button type="submit">
              <FiSearch className="mr-2" />
              Buscar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <FiFilter className="mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* Painel de Filtros */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => handleCategoryChange(e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Todas</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preço Mínimo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço Mínimo
                </label>
                <input
                  type="number"
                  placeholder="R$ 0,00"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Preço Máximo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço Máximo
                </label>
                <input
                  type="number"
                  placeholder="R$ 9999,99"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Ordenação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="recentes">Mais Recentes</option>
                  <option value="preco_asc">Menor Preço</option>
                  <option value="preco_desc">Maior Preço</option>
                  <option value="nome_asc">Nome A-Z</option>
                  <option value="nome_desc">Nome Z-A</option>
                </select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" onClick={handleClearFilters}>
                  <FiX className="mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Grid de Produtos */}
        {produtos.length === 0 ? (
          <EmptyState
            icon={<FiShoppingBag size={64} />}
            title="Nenhum produto encontrado"
            description="Tente ajustar os filtros"
            action={
              activeFiltersCount > 0 && (
                <Button onClick={handleClearFilters}>
                  Limpar Filtros
                </Button>
              )
            }
          />
        ) : (
          <>
            <ProductsGrid
              produtos={produtos}
              onAddToCart={addItem}
              loading={loadingMore}
              columns={3}
            />

            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={page + 1}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}