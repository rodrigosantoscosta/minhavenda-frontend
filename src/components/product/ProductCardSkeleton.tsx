export default function ProductCardSkeleton() {
  return (
    <div className="rounded-lg overflow-hidden border border-border bg-card animate-pulse">
      <div className="flex flex-col">
        {/* Image skeleton — square */}
        <div className="w-full aspect-square bg-muted" />

        {/* Content skeleton */}
        <div className="flex flex-col flex-1 p-3">
          {/* Category placeholder */}
          <div className="h-2.5 bg-muted rounded w-1/4 mb-2" />
          {/* Title placeholder */}
          <div className="space-y-1.5 mb-2">
            <div className="h-3.5 bg-muted rounded" />
            <div className="h-3.5 bg-muted rounded w-3/4" />
          </div>
          {/* Price placeholder */}
          <div className="mt-auto">
            <div className="h-3.5 bg-muted rounded w-1/3" />
          </div>
        </div>
      </div>
    </div>
  )
}
