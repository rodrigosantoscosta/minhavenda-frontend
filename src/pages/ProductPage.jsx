import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import productService from '../services/productService'
import ProductCard from '../components/common/ProductCard'
import { useToast } from '../components/common/Toast'
import { LoadingContainer } from '../components/common/Loading'
import Button from '../components/common/Button'
import { FiFilter, FiGrid, FiList, FiRefreshCw } from 'react-icons/fi'

/**
 * ProductPage - Página de Listagem de Produtos
 * 
 * Carrega produtos do backend com imagens
 */
export default function ProductPage() {
  const [produtos, setProdutos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [viewMode, setViewMode] = useState('grid')
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 12

  const toast = useToast()
  const navigate = useNavigate()

  /**
   * Buscar produtos do backend
   */
  const fetchProdutos = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        ativo: true
      }

      const response = await productService.getProdutos(params)
      
      // Suportar resposta paginada ou lista simples
      if (response?.content) {
        setProdutos(response.content)
        setTotalPages(response.totalPages)
        setTotalElements(response.totalElements)
      } else if (Array.isArray(response)) {
        setProdutos(response)
        setTotalPages(1)
        setTotalElements(response.length)
      } else {
        setProdutos([])
        setTotalPages(0)
        setTotalElements(0)
      }

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar produtos'
      setError(errorMessage)
      toast.error(errorMessage)
      setProdutos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProdutos()
  }, [currentPage])

  const handleAddToCart = (produto) => {
    toast.success(`${produto.nome} adicionado ao carrinho!`)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Nossos Produtos
          </h1>
          <p className="text-lg text-gray-600">
            Encontre os melhores produtos com os melhores preços
          </p>
          {totalElements > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {totalElements} {totalElements === 1 ? 'produto' : 'produtos'}
            </p>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
          <Button 
            variant="outline" 
            leftIcon={<FiRefreshCw />} 
            onClick={fetchProdutos}
            size="sm"
          >
            Atualizar
          </Button>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              onClick={() => setViewMode('grid')}
              size="sm"
            >
              <FiGrid className="mr-2" />
              Grade
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              onClick={() => setViewMode('list')}
              size="sm"
            >
              <FiList className="mr-2" />
              Lista
            </Button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando produtos...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-600 text-lg mb-4">❌ {error}</p>
            <Button onClick={fetchProdutos} variant="primary">
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && produtos.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg mb-2">📦 Nenhum produto encontrado</p>
            <Button onClick={fetchProdutos} variant="outline">Recarregar</Button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && produtos.length > 0 && (
          <>
            <div className={`
              grid gap-6 mb-8
              ${viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
              }
            `}>
              {produtos.map((produto) => (
                <ProductCard
                  key={produto.id}
                  product={produto}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  ← Anterior
                </Button>

                <span className="text-gray-600 font-medium">
                  Página {currentPage + 1} de {totalPages}
                </span>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1}
                >
                  Próxima →
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}