export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      {/* Skeleton da Imagem */}
      <div className="aspect-square bg-gray-200" />
      
      {/* Skeleton do Conteúdo */}
      <div className="p-4">
        {/* Categoria */}
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
        
        {/* Nome */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
        
        {/* Avaliação */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-10" />
        </div>
        
        {/* Preço */}
        <div className="mb-4">
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-2/3" />
        </div>
        
        {/* Botão */}
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  )
}
