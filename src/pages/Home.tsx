import { useState, useEffect } from 'react'
import type { Product, Category } from '../types'
import { useCart } from '../contexts/CartContext'
import productService from '../services/productService'
import CategoryNav from '../components/home/CategoryNav'
import HeroSection from '../components/home/HeroSection'
import FeaturesSection from '../components/home/FeaturesSection'
import ProductsGrid from '../components/product/ProductsGrid'
import Pagination from '../components/common/Pagination'
import Loading from '../components/common/Loading'
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

  const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null)

  // Hero content — dynamic (can be fetched from backend in future)
  const heroContent = {
    title: 'Descubra Produtos Incríveis',
    subtitle: 'Encontre tudo que você precisa com os melhores preços e entrega rápida para todo o Brasil.',
    primaryCta: { label: 'Ver Produtos', href: '#products' },
    secondaryCta: { label: 'Saiba Mais', href: '/sobre' },
  }

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

      const params: Record<string, unknown> = {
        page,
        size: pageSize,
        sort: 'dataCadastro',
        sortDir: 'DESC',
        ativo: true,
      }
      if (selectedCategory) params.categoriaId = selectedCategory

      const raw = await productService.getProdutos(params as any)
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
    <div className="bg-background min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title={heroContent.title}
        subtitle={heroContent.subtitle}
        primaryCta={heroContent.primaryCta}
        secondaryCta={heroContent.secondaryCta}
      />

      {/* Category Navigation */}
      {categorias.length > 0 && (
        <div className="border-b border-border py-3">
          <div className="container mx-auto px-4">
            <CategoryNav
              categorias={categorias}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>
        </div>
      )}

      {/* Products Section */}
      <section className="py-10" id="products">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="flex items-end justify-between mb-6 pb-4 border-b border-border">
            <div className="animate-fadeInUp">
              <h2 className="font-display font-semibold text-xl text-foreground tracking-tight">
                {selectedCategory
                  ? categorias.find(c => c.id === selectedCategory)?.nome
                  : 'Produtos em Destaque'}
              </h2>
              {totalElements > 0 && (
                <p className="font-sans text-sm text-muted-foreground mt-1 tabular-nums animate-fadeInUp" style={{ animationDelay: '80ms' }}>
                  {totalElements} {totalElements === 1 ? 'produto' : 'produtos'}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedCategory && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCategoryChange(null)}
                >
                  Limpar filtro
                </Button>
              )}
              <a href="/produtos" className="btn btn-ghost text-sm font-sans font-medium text-muted-foreground hover:text-foreground transition-colors">
                Ver Todos →
              </a>
            </div>
          </div>

          {/* Products Grid */}
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

      {/* Features Section */}
      <FeaturesSection />
    </div>
  )
}
