// src/components/common/EmptyState.jsx - ESTADO VAZIO
export default function EmptyState({ 
  icon, 
  title, 
  description, 
  action 
}) {
  return (
    <div className="text-center py-16 px-4">
      {/* Ícone */}
      {icon && (
        <div className="flex justify-center mb-6 text-gray-400">
          {icon}
        </div>
      )}

      {/* Título */}
      {title && (
        <h3 className="text-2xl font-semibold text-gray-900 mb-3">
          {title}
        </h3>
      )}

      {/* Descrição */}
      {description && (
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          {description}
        </p>
      )}

      {/* Ação (botão, link, etc) */}
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  )
}
