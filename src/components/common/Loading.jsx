export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Carregando...</p>
      </div>
    </div>
  )
}

export function Spinner({ size = 'md' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-16 w-16 border-4',
  }

  return (
    <div className={`inline-block animate-spin rounded-full border-t-primary-600 border-b-primary-600 ${sizeClasses[size]}`}></div>
  )
}