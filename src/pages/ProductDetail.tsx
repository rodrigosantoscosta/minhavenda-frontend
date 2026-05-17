
import { useState, useEffect } from 'react'
import type { Product } from '../types'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../components/common/Toast'
import productService from '../services/productService'
import logger from '../utils/logger'
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
  FiStar,
  FiCheck
} from 'react-icons/fi'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem, isInCart, getItemQuantity } = useCart()
  const toast = useToast()

  const [produto, setProduto] = useState<Product | null>(null)
  const [produtosRelacionados, setProdutosRelacionados] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantidade, setQuantidade] = useState(1)
  const [imagemSelecionada, setImagemSelecionada] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (id) loadProduto()
  }, [id])

  useEffect(() => {
    if (produto?.categoria?.id) loadProdutosRelacionados()
  }, [produto])

  const loadProduto = async () => {
    try {
      setLoading(true)
      const data = await productService.getProdutoById(id ?? '')
      setProduto(data)
      const quantidadeCarrinho = getItemQuantity(id ?? '')
      if (quantidadeCarrinho > 0) setQuantidade(quantidadeCarrinho)
    } catch (error) {
      logger.error({ error: (error as Error).message, produtoId: id }, 'Erro ao carregar produto')
      toast.error('Produto não encontrado')
      navigate('/produtos')
    } finally {
      setLoading(false)
    }
  }

  const loadProdutosRelacionados = async () => {
    try {
      const raw = await productService.getProdutos({
        categoriaId: produto?.categoria?.id,
        page: 0,
        size: 4,
        ativo: true
      } as any)
      const data = raw as any
      const relacionados = (data.content || data)
        .filter((p: Product) => p.id !== produto?.id)
        .slice(0, 4)
      setProdutosRelacionados(relacionados)
    } catch (error) {
      logger.error({ error: (error as Error).message, categoriaId: produto?.categoria?.id }, 'Erro ao carregar produtos relacionados')
    }
  }

  const handleAddToCart = () => {
    if (!produto) return
    if (quantidadeEstoque !== null && quantidade > quantidadeEstoque) {
      toast.error(`Apenas ${quantidadeEstoque} unidades disponíveis`)
      return
    }
    addItem(produto, quantidade)
  }

  const handleBuyNow = async () => {
    if (!produto) return
    if (quantidadeEstoque !== null && quantidade > quantidadeEstoque) {
      toast.error(`Apenas ${quantidadeEstoque} unidades disponíveis`)
      return
    }
    await addItem(produto, quantidade)
    navigate('/carrinho')
  }

  const handleQuantityChange = (novaQuantidade: number) => {
    if (quantidadeEstoque !== null && novaQuantidade > quantidadeEstoque) {
      toast.warning(`Apenas ${quantidadeEstoque} unidades disponíveis`)
      setQuantidade(quantidadeEstoque)
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
      navigator.share({ title: produto?.nome, text: produto?.descricao, url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copiado para área de transferência')
    }
  }

  if (loading) return <Loading />

  if (!produto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h2>
          <Link to="/produtos"><Button>Ver Produtos</Button></Link>
        </div>
      </div>
    )
  }

  const precoBase = typeof produto.preco === 'object' ? (produto.preco as any)?.valor : produto.preco
  const precoPromocional = produto.precoPromocional ?? null
  const quantidadeEstoque = produto.quantidadeEstoque ?? null

  const desconto = precoPromocional && precoBase
    ? Math.round(((precoBase - precoPromocional) / precoBase) * 100)
    : 0

  const precoFinal = precoPromocional ?? precoBase ?? 0
  const temEstoque = quantidadeEstoque === null || quantidadeEstoque > 0
  const estoqueMinimo = quantidadeEstoque !== null && quantidadeEstoque <= 5 && quantidadeEstoque > 0

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Produtos', path: '/produtos' },
    { label: produto.categoriaNome || 'Categoria', path: `/produtos?categoriaId=${produto.categoria?.id}` },
    { label: produto.nome, path: '#' }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Product Detail */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Gallery */}
          <div>
            <ImageGallery
              images={produto.imagens || (produto.imagem ? [produto.imagem] : [])}
              selectedIndex={imagemSelecionada}
              onSelectImage={setImagemSelecionada}
            />
          </div>

          {/* Product Info */}
          <div>
            {/* Category + Badges */}
            <div className="flex items-center gap-3 mb-3">
              <Link
                to={`/produtos?categoriaId=${produto.categoria?.id}`}
                className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                {produto.categoria?.nome}
              </Link>
              {produto.ativo && <Badge variant="warning" size="sm">Destaque</Badge>}
              {desconto > 0 && <Badge variant="danger" size="sm">-{desconto}%</Badge>}
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4 tracking-tight">
              {produto.nome}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={18}
                    className={i < ((produto.avaliacoes?.length || 0) > 0 ? 4 : 0) ? 'text-yellow-400 fill-current' : 'text-muted-foreground/30'}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({produto.numeroAvaliacoes || 0} avaliações)</span>
              <span className="text-sm text-muted-foreground">|</span>
              <span className="text-sm text-muted-foreground">{produto.vendidos || 0} vendidos</span>
            </div>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-border">
              {desconto > 0 && (
                <p className="text-lg text-muted-foreground line-through mb-1 tabular-nums">
                  R$ {precoBase?.toFixed(2)}
                </p>
              )}
              <div className="flex items-baseline gap-3 flex-wrap">
                <p className="text-3xl font-bold text-foreground tabular-nums">
                  R$ {precoFinal.toFixed(2)}
                </p>
                {desconto > 0 && (
                  <span className="text-base text-success font-medium">
                    Economize R$ {(precoBase - precoFinal).toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                ou 10x de R$ {(precoFinal / 10).toFixed(2)} sem juros
              </p>
            </div>

            {/* Description */}
            {produto.descricao && (
              <div className="mb-6">
                <h3 className="font-sans font-semibold text-base text-foreground mb-2">Descrição</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{produto.descricao}</p>
              </div>
            )}

            {/* Features Checklist */}
            <ul className="mb-6 space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiCheck className="text-success shrink-0" size={16} />
                Frete grátis para compras acima de R$ 99
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiCheck className="text-success shrink-0" size={16} />
                Garantia de 30 dias — devolução grátis
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiCheck className="text-success shrink-0" size={16} />
                Pagamento 100% seguro
              </li>
              {temEstoque && (
                <li className="flex items-center gap-2 text-sm text-success font-medium">
                  <FiCheck className="shrink-0" size={16} />
                  {estoqueMinimo
                    ? `Últimas ${quantidadeEstoque} unidades!`
                    : quantidadeEstoque !== null
                    ? `Em estoque (${quantidadeEstoque} disponíveis)`
                    : 'Em estoque'}
                </li>
              )}
            </ul>

            {/* Stock Status */}
            {!temEstoque && (
              <div className="mb-6">
                <Badge variant="danger">Produto Esgotado</Badge>
              </div>
            )}

            {/* Quantity */}
            {temEstoque && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-2">Quantidade:</label>
                <QuantitySelector
                  value={quantidade}
                  onChange={handleQuantityChange}
                  min={1}
                  max={quantidadeEstoque ?? undefined}
                />
              </div>
            )}

            {/* Action Buttons */}
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
                variant="success"
                size="lg"
                className="flex-1"
              >
                Comprar Agora
              </Button>
            </div>

            {/* Favorite + Share */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  isFavorite
                    ? 'border-red-300 bg-red-50 text-red-600'
                    : 'border-border hover:border-ring/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <FiHeart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
                <span className="text-sm font-medium">{isFavorite ? 'Favoritado' : 'Favoritar'}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-ring/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <FiShare2 size={18} />
                <span className="text-sm font-medium">Compartilhar</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="bg-secondary rounded-xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <FiTruck className="text-foreground mt-0.5 shrink-0" size={20} />
                <div>
                  <p className="font-medium text-foreground text-sm">Entrega Rápida</p>
                  <p className="text-xs text-muted-foreground">para compras acima de R$ 99</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiShield className="text-foreground mt-0.5 shrink-0" size={20} />
                <div>
                  <p className="font-medium text-foreground text-sm">Garantia de 30 dias</p>
                  <p className="text-xs text-muted-foreground">Devolução grátis</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FiCreditCard className="text-foreground mt-0.5 shrink-0" size={20} />
                <div>
                  <p className="font-medium text-foreground text-sm">Pagamento Seguro</p>
                  <p className="text-xs text-muted-foreground">Compra 100% protegida</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Info (specs, details) */}
        <ProductInfo produto={produto} />

        {/* Related Products */}
        {produtosRelacionados.length > 0 && (
          <div className="mt-12">
            <RelatedProducts produtos={produtosRelacionados} />
          </div>
        )}
      </div>
    </div>
  )
}
