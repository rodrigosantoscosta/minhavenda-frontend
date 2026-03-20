export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="flex sm:flex-col">
        {/* Image skeleton */}
        <div className="w-28 flex-shrink-0 sm:w-full sm:aspect-square bg-gray-200" style={{ minHeight: '7rem' }} />

        {/* Content skeleton */}
        <div className="flex flex-col flex-1 p-2.5 sm:p-3">
          <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="space-y-1.5 mb-2">
            <div className="h-3.5 bg-gray-200 rounded" />
            <div className="h-3.5 bg-gray-200 rounded w-3/4" />
          </div>
          <div className="hidden sm:flex items-center gap-2 mb-2">
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
          <div className="mt-auto space-y-1">
            <div className="h-3 bg-gray-200 rounded w-1/3" />
            <div className="h-5 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="h-8 bg-gray-200 rounded mt-2" />
        </div>
      </div>
    </div>
  )
}
