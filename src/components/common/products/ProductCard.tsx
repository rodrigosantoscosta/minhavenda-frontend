import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../../ui/badge'
import type { Product } from '../../../types'

export interface ProductCardProps {
  produto: Product & { 
    categoriaNome?: string
    precoPromocional?: number
    quantidadeEstoque?: number | null
    destaque?: boolean
    avaliacao?: number
    numeroAvaliacoes?: number
    urlImagem?: string
  }
  viewMode?: 'grid' | 'list'
}

export default function ProductCard({ produto, viewMode: _viewMode = 'grid' }: ProductCardProps): React.JSX.Element {
  const [imageError, setImageError] = useState(false)

  const precoBase = typeof produto.preco === 'object' ? (produto.preco as any)?.valor : produto.preco
  const precoPromocional = produto.precoPromocional ?? null

  const calcularDesconto = (): number => {
    if (!precoPromocional || !precoBase) return 0
    return Math.round(((precoBase - precoPromocional) / precoBase) * 100)
  }

  const desconto = calcularDesconto()
  const precoFinal = precoPromocional ?? precoBase ?? 0

  const imgSrc = imageError || !produto.urlImagem
    ? 'https://placehold.co/400x400/e5e7eb/9ca3af?text=Sem+imagem'
    : produto.urlImagem

  return (
    <Link
      to={`/produto/${produto.id}`}
      className="group block bg-card rounded-lg border border-border overflow-hidden transition-colors duration-150 hover:border-foreground/20"
    >
      <div className="flex flex-col">
        {/* Image */}
        <div className="relative w-full aspect-square overflow-hidden bg-muted">
          <img
            src={imgSrc}
            alt={produto.nome}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />

          {/* Discount badge */}
          {desconto > 0 && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive" className="text-[10px] font-semibold px-1.5 py-0 rounded">
                -{desconto}%
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-3 min-w-0">
          <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider truncate">
            {produto.categoriaNome || 'Sem categoria'}
          </p>

          <h3 className="text-sm font-medium text-foreground mb-2 line-clamp-2 leading-snug transition-colors duration-150 group-hover:text-primary">
            {produto.nome}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <p className="text-sm font-semibold text-foreground tabular-nums">
              R$ {precoFinal.toFixed(2).replace('.', ',')}
            </p>
            {desconto > 0 && precoBase != null && (
              <p className="text-xs text-muted-foreground line-through">
                R$ {precoBase.toFixed(2).replace('.', ',')}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
