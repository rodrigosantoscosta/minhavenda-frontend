
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../components/common/Toast'
import productService from '../services/productService'
import ImageGallery from '../components/product/ImageGallery'
import ProductInfo from '../components/product/ProductInfo'
import QuantitySelector from '../components/product/QuantitySelector'
import RelatedProducts from '../components/product/RelatedProducts'
import Breadcrumb from '../components/common/Breadcrumb'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { 
  FiShoppingCart, 
  FiHeart,
  FiShare2,
  FiTruck,
  FiShield,
  FiCreditCard,
  FiStar
} from 'react-icons/fi'

export default function ProductDetail() {
  const { id } = useParams() // ID do produto na URL
  const navigate = useNavigate()
  const { addItem, isInCart, getItemQuantity } = useCart()
  const toast = useToast()

  // Estados
  const [produto, setProduto] = useState(null)
  const [produtosRelacionados, setProdutosRelacionados] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantidade, setQuantidade] = useState(1)
  const [imagemSelecionada, setImagemSelecionada] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  // Carregar produto ao montar ou quando ID mudar
  useEffect(() => {
    if (id) {
      loadProduto()
    }
  }, [id])

  // Carregar produtos relacionados após carregar produto principal
  useEffect(() => {
    if (produto?.categoria?.id) {
      loadProdutosRelacionados()
    }
  }, [produto])

  const loadProduto = async () => {
    try {
      setLoading(true)
      const data = await productService.getProdutoById(id)
      setProduto(data)
      
      // Se produto já está no carrinho, mostrar quantidade atual
      const quantidadeCarrinho = getItemQuantity(id)
      if (quantidadeCarrinho > 0) {
        setQuantidade(quantidadeCarrinho)
      }
    } catch (error) {
      logger.error('Erro ao carregar produto', { error: error.message, produtoId: id })
      toast.error('Produto não encontrado')
      navigate('/produtos')
    } finally {
      setLoading(false)
    }
  }

  const loadProdutosRelacionados = async () => {
    try {
      const params = {
        categoriaId: produto.categoria.id,
        page: 0,
        size: 4,
        ativo: true
      }
      
      const data = await productService.getProdutos(params)
      
      // Filtrar para não mostrar o produto atual
      const relacionados = (data.content || data)
        .filter(p => p.id !== produto.id)
        .slice(0, 4)
      
      setProdutosRelacionados(relacionados)
    } catch (error) {
      logger.error('Erro ao carregar produtos relacionados', { error: error.message, categoriaId: produto?.categoria?.id })
    }
  }

  const handleAddToCart = () => {
    if (!produto) return
    
    if (quantidade > produto.quantidadeEstoque) {
      toast.error(`Apenas ${produto.quantidadeEstoque} unidades disponíveis`)
      return
    }

    addItem(produto, quantidade)
    toast.success(`${quantidade} ${quantidade === 1 ? 'item adicionado' : 'itens adicionados'} ao carrinho`)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    navigate('/carrinho')
  }

  const handleQuantityChange = (novaQuantidade) => {
    if (novaQuantidade > produto.quantidadeEstoque) {
      toast.warning(`Apenas ${produto.quantidadeEstoque} unidades disponíveis`)
      setQuantidade(produto.quantidadeEstoque)
      return
    }
    setQuantidade(novaQuantidade)
  }

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? 'Removido dos favoritos' : 'Adicionado aos favoritos')
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: produto.nome,
        text: produto.descricao,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copiado para área de transferência')
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!produto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h2>
          <Link to="/produtos">
            <Button>Ver Produtos</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Calcular desconto
  const desconto = produto.precoPromocional 
    ? Math.round(((produto.preco.valor - produto.precoPromocional) / produto.preco.valor) * 100)
    : 0
  
  const precoFinal = produto.precoPromocional || produto.preco.valor
  const temEstoque = produto.quantidadeEstoque > 0
  const estoqueMinimo = produto.quantidadeEstoque <= 5 && produto.quantidadeEstoque > 0

  // Breadcrumb
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Produtos', path: '/produtos' },
    { label: produto.categoriaNome || 'Categoria', path: `/produtos?categoriaId=${produto.categoria?.id}` },
    { label: produto.nome, path: '#' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          
          {/* Galeria de Imagens (Esquerda) */}
          <div>
            <ImageGallery 
              images={produto.imagens || [produto.imagem]}
              selectedIndex={imagemSelecionada}
              onSelectImage={setImagemSelecionada}
            />
          </div>

          {/* Informações do Produto (Direita) */}
          <div>
            {/* Categoria e Badge */}
            <div className="flex items-center gap-3 mb-3">
              <Link 
                to={`/produtos?categoriaId=${produto.categoria?.id}`}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {produto.categoria?.nome}
              </Link>
              {produto.destaque && (
                <Badge variant="warning" size="sm">Destaque</Badge>
              )}
              {desconto > 0 && (
                <Badge variant="danger" size="sm">-{desconto}%</Badge>
              )}
            </div>

            {/* Nome do Produto */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {produto.nome}
            </h1>

            {/* Avaliação */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={20}
                    className={i < (produto.avaliacao || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                ({produto.numeroAvaliacoes || 0} avaliações)
              </span>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-gray-600">
                {produto.vendidos || 0} vendidos
              </span>
            </div>

            {/* Preços */}
            <div className="mb-6">
              {desconto > 0 && (
                <p className="text-lg text-gray-500 line-through mb-1">
                  R$ {produto.preco.valor.toFixed(2)}
                </p>
              )}
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-bold text-primary-600">
                  R$ {precoFinal.toFixed(2)}
                </p>
                {desconto > 0 && (
                  <span className="text-lg text-green-600 font-medium">
                    Economize R$ {(produto.preco.valor - precoFinal).toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                ou 10x de R$ {(precoFinal / 10).toFixed(2)} sem juros
              </p>
            </div>

            {/* Descrição Curta */}
            {produto.descricao && (
              <div className="mb-6 pb-6 border-b">
                <p className="text-gray-700 leading-relaxed">
                  {produto.descricao}
                </p>
              </div>
            )}

            {/* Estoque */}
            <div className="mb-6">
              {!temEstoque ? (
                <Badge variant="danger">Produto Esgotado</Badge>
              ) : estoqueMinimo ? (
                <div className="flex items-center gap-2">
                  <Badge variant="warning">Últimas {produto.quantidadeEstoque} unidades!</Badge>
                </div>
              ) : (
                <p className="text-sm text-green-600 font-medium">
                  ✓ Em estoque ({produto.quantidadeEstoque} disponíveis)
                </p>
              )}
            </div>

            {/* Quantidade Selector */}
            {temEstoque && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantidade:
                </label>
                <QuantitySelector
                  value={quantidade}
                  onChange={handleQuantityChange}
                  min={1}
                  max={produto.quantidadeEstoque}
                />
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button
                onClick={handleAddToCart}
                disabled={!temEstoque}
                variant={isInCart(produto.id) ? 'success' : 'primary'}
                size="lg"
                className="flex-1"
              >
                <FiShoppingCart className="mr-2" />
                {isInCart(produto.id) ? 'Atualizar Carrinho' : 'Adicionar ao Carrinho'}
              </Button>
              
              <Button
                onClick={handleBuyNow}
                disabled={!temEstoque}
                variant="outline"
                size="lg"
              >
                Comprar Agora
              </Button>
            </div>

            {/* Botões Secundários */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  isFavorite 
                    ? 'border-red-300 bg-red-50 text-red-600' 
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <FiHeart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                <span className="text-sm font-medium">
                  {isFavorite ? 'Favoritado' : 'Favoritar'}
                </span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-gray-400 text-gray-700 transition-colors"
              >
                <FiShare2 size={20} />
                <span className="text-sm font-medium">Compartilhar</span>
              </button>
            </div>

            {/* Features/Garantias */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <FiTruck className="text-primary-600 mt-1" size={24} />
                <div>
                  <p className="font-medium text-gray-900">Frete Grátis</p>
                  <p className="text-sm text-gray-600">para compras acima de R$ 99</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FiShield className="text-primary-600 mt-1" size={24} />
                <div>
                  <p className="font-medium text-gray-900">Garantia de 30 dias</p>
                  <p className="text-sm text-gray-600">Devolução grátis</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <FiCreditCard className="text-primary-600 mt-1" size={24} />
                <div>
                  <p className="font-medium text-gray-900">Pagamento Seguro</p>
                  <p className="text-sm text-gray-600">Compra 100% protegida</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informações Detalhadas */}
        <ProductInfo produto={produto} />

        {/* Produtos Relacionados */}
        {produtosRelacionados.length > 0 && (
          <div className="mt-12">
            <RelatedProducts produtos={produtosRelacionados} />
          </div>
        )}
      </div>
    </div>
  )
}