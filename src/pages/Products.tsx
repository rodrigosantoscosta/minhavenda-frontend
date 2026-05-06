// src/pages/Products.jsx - LAYOUT COM SIDEBAR DE FILTROS
import { useState, useEffect } from 'react'
import type React from 'react'
import type { Product, Category } from '../types'
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
import { useScrollOnPageChange } from '../hooks/useScrollOnPageChange'
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
  const [produtos, setProdutos] = useState<Product[]>([])
  const [categorias, setCategorias] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // Paginação
  const [page, setPage] = useState(0)
  useScrollOnPageChange(page)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 12

  // Filtros
  const [searchTerm, setSearchTerm] = useState(searchParams.get('busca') || '')
  const [selectedCategory, setSelectedCategory] = useState<string | number | null>(searchParams.get('categoriaId') || null)
  const [minPrice, setMinPrice] = useState(searchParams.get('precoMin') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('precoMax') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('ordem') || 'recentes')

  // UI — sidebar visível por padrão em desktop, colapsável em mobile
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
    const params: Record<string, string> = {}
    if (searchTerm) params.busca = searchTerm
    if (selectedCategory) params.categoriaId = String(selectedCategory)
    if (minPrice) params.precoMin = String(minPrice)
    if (maxPrice) params.precoMax = String(maxPrice)
    if (sortBy && sortBy !== 'recentes') params.ordem = sortBy
    setSearchParams(params)
  }, [searchTerm, selectedCategory, minPrice, maxPrice, sortBy])

  const loadCategorias = async () => {
    try {
      const data = await productService.getCategorias()
      setCategorias(Array.isArray(data) ? data : [])
    } catch (error) {
      logger.error({ error: (error as Error).message }, 'Erro ao carregar categorias')
      toast.error('Erro ao carregar categorias')
    }
  }

  const loadProdutos = async () => {
    try {
      if (page === 0) { setLoading(true) } else { setLoadingMore(true) }

      const params: Record<string, unknown> = { page, size: pageSize, ativo: true }
      if (searchTerm) params.termo = searchTerm
      if (selectedCategory) params.categoriaId = selectedCategory
      if (minPrice) params.precoMin = parseFloat(minPrice as string)
      if (maxPrice) params.precoMax = parseFloat(maxPrice as string)

      const sortMapping = {
        recentes: 'dataCadastro:desc',
        preco_asc: 'preco:asc',
        preco_desc: 'preco:desc',
        nome_asc: 'nome:asc',
        nome_desc: 'nome:desc',
      }
      params.sort = sortMapping[sortBy as keyof typeof sortMapping] || 'dataCadastro:desc'

      const raw = await productService.getProdutos(params)
      const data = raw as any

      let produtosArray: Product[] = []
      if (data?.content && Array.isArray(data.content)) {
        produtosArray = data.content
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      } else if (Array.isArray(data)) {
        produtosArray = data
        setTotalPages(1)
        setTotalElements(data.length)
      } else if (data?.produtos && Array.isArray(data.produtos)) {
        produtosArray = data.produtos
        setTotalPages(data.totalPages || 1)
        setTotalElements(data.total || data.produtos.length)
      }

      setProdutos(produtosArray)
    } catch (error) {
      logger.error({ error: (error as Error).message }, 'Erro ao carregar produtos')
      toast.error('Erro ao carregar produtos')
      setProdutos([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(0)
  }

  const handleCategoryChange = (categoryId: string | number | null) => {
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage - 1)
  }

  const activeFiltersCount = [searchTerm, selectedCategory, minPrice, maxPrice].filter(Boolean).length

  if (loading && page === 0) return <Loading />

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Produtos</h1>
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
                className="w-full pl-12 pr-12 py-3 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(''); setPage(0) }}
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
            {/* Botão de filtros visível apenas em mobile */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="relative lg:hidden"
            >
              <FiFilter className="mr-2" />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </form>

        {/* Layout principal: sidebar + grid */}
        <div className="flex gap-8 items-start">

          {/* ── SIDEBAR DE FILTROS ── */}
          <aside className={`
            w-64 flex-shrink-0 bg-white rounded-lg shadow-sm border border-gray-200 p-6
            lg:block
            ${showFilters ? 'block' : 'hidden'}
          `}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <FiFilter size={16} />
                Filtros
              </h2>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-foreground hover:text-foreground/70 font-medium flex items-center gap-1"
                >
                  <FiX size={14} />
                  Limpar
                </button>
              )}
            </div>

            <div className="space-y-6">
              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => handleCategoryChange(e.target.value || null)}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-sm"
                >
                  <option value="">Todas</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
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
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-sm"
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
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-sm"
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
                  className="w-full px-3 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-ring text-sm"
                >
                  <option value="recentes">Mais Recentes</option>
                  <option value="preco_asc">Menor Preço</option>
                  <option value="preco_desc">Maior Preço</option>
                  <option value="nome_asc">Nome A-Z</option>
                  <option value="nome_desc">Nome Z-A</option>
                </select>
              </div>
            </div>
          </aside>

          {/* ── CONTEÚDO: GRID + PAGINAÇÃO ── */}
          <div className="flex-1 min-w-0">
            {produtos.length === 0 ? (
              <EmptyState
                icon={<FiShoppingBag size={64} />}
                title="Nenhum produto encontrado"
                description="Tente ajustar os filtros"
                action={
                  activeFiltersCount > 0 && (
                    <Button onClick={handleClearFilters}>Limpar Filtros</Button>
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

      </div>
    </div>
  )
}
