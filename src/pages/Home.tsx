import { useState, useEffect } from 'react'
import type { Product, Category } from '../types'
import { useCart } from '../contexts/CartContext'
import productService from '../services/productService'
import CategoryFilter from '../components/product/CategoryFilter'
import ProductsGrid from '../components/product/ProductsGrid'
import Pagination from '../components/common/Pagination'
import Loading from '../components/common/Loading'
import { useScrollOnPageChange } from '../hooks/useScrollOnPageChange'
import EmptyState from '../components/common/EmptyState'
import Button from '../components/common/Button'
import logger from '../utils/logger'

import { FiShoppingBag } from 'react-icons/fi'

export default function Home() {
  const { addItem } = useCart()

  const [produtos, setProdutos] = useState<Product[]>([])
  const [categorias, setCategorias] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 12
  useScrollOnPageChange(page)

  const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null)

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (!loading) {
      loadProdutos()
    }
  }, [selectedCategory, page])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadCategorias(),
        loadProdutos(),
      ])
    } catch (error) {
      logger.error({ error }, 'Erro ao carregar dados iniciais')
    } finally {
      setLoading(false)
    }
  }

  const loadCategorias = async () => {
    try {
      const data = await productService.getCategorias()
      setCategorias(Array.isArray(data) ? data : [])
    } catch (error) {
      logger.error({ error }, 'Erro ao carregar categorias')
      setCategorias([])
    }
  }

  const loadProdutos = async () => {
    try {
      if (page === 0) setLoading(true)
      else setLoadingMore(true)

      const params = {
        page,
        size: pageSize,
        sort: 'dataCadastro',
        sortDir: 'DESC',
        ativo: true,
      }
      if (selectedCategory) params.categoriaId = selectedCategory

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
      logger.error({ error }, 'Erro ao carregar produtos')
      setProdutos([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleAddToCart = (produto: Product) => {
    addItem(produto, 1)
  }

  const handleCategoryChange = (categoryId: string | number | null) => {
    setSelectedCategory(categoryId)
    setPage(0)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage - 1)
  }

  if (loading && page === 0) {
    return <Loading />
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Catálogo Principal */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header — skill: text-balance heading, tabular-nums count, stagger */}
          <div className="flex items-end justify-between mb-6 border-b border-gray-100 pb-5">
            <div className="animate-fadeInUp">
              <h1 className="font-display font-bold text-2xl text-gray-900 tracking-tight text-balance">
                {selectedCategory
                  ? categorias.find(c => c.id === selectedCategory)?.nome
                  : 'Todos os Produtos'}
              </h1>
              {totalElements > 0 && (
                <p className="font-sans text-sm text-gray-400 mt-1 tabular-nums animate-fadeInUp" style={{ animationDelay: '80ms' }}>
                  {totalElements} {totalElements === 1 ? 'produto' : 'produtos'}
                </p>
              )}
            </div>

            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCategoryChange(null)}
              >
                Limpar filtro
              </Button>
            )}
          </div>

          {/* Category Filter */}
          {categorias.length > 0 && (
            <div className="mb-8">
              <CategoryFilter
                categorias={categorias}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          )}

          {/* Products */}
          {produtos.length === 0 ? (
            <EmptyState
              icon={<FiShoppingBag size={64} />}
              title="Nenhum produto encontrado"
              description={
                selectedCategory
                  ? 'Não há produtos nesta categoria no momento'
                  : 'Estamos preparando novidades para você!'
              }
              action={
                selectedCategory && (
                  <Button onClick={() => handleCategoryChange(null)}>
                    Ver Todos os Produtos
                  </Button>
                )
              }
            />
          ) : (
            <>
              <ProductsGrid
                produtos={produtos}
                onAddToCart={handleAddToCart}
                loading={loadingMore}
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
      </section>
    </div>
  )
}
