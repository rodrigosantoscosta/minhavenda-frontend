import { 
  FiClock, 
  FiCheck, 
  FiTruck, 
  FiPackage, 
  FiX,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi'

/**
 * StatusBadge Component
 * 
 * Badge colorido para exibir status de pedidos
 * Com ícones e cores específicas para cada status
 */
export default function StatusBadge({ 
  status, 
  size = 'md',
  showIcon = true,
  className = '',
  variant = 'default' // default | pill | square
}) {
  // Configurações de status
  const statusConfig = {
    PENDENTE: {
      label: 'Pendente',
      description: 'Aguardando confirmação',
      color: 'warning',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      icon: FiClock
    },
    PAGO: {
      label: 'Pago',
      description: 'Pagamento confirmado',
      color: 'info',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      icon: FiCheck
    },
    PROCESSANDO: {
      label: 'Processando',
      description: 'Em preparação',
      color: 'info',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      icon: FiRefreshCw
    },
    ENVIADO: {
      label: 'Enviado',
      description: 'A caminho',
      color: 'info',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      icon: FiTruck
    },
    ENTREGUE: {
      label: 'Entregue',
      description: 'Pedido entregue',
      color: 'success',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      icon: FiCheck
    },
    CANCELADO: {
      label: 'Cancelado',
      description: 'Pedido cancelado',
      color: 'danger',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      icon: FiX
    },
    DEVOLVIDO: {
      label: 'Devolvido',
      description: 'Pedido devolvido',
      color: 'danger',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-800',
      icon: FiPackage
    },
    TROCA: {
      label: 'Em Troca',
      description: 'Solicitada troca',
      color: 'warning',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      icon: FiRefreshCw
    },
    AGUARDANDO: {
      label: 'Aguardando',
      description: 'Aguardando ação',
      color: 'warning',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      icon: FiAlertCircle
    }
  }

  // Obter configuração do status
  const config = statusConfig[status] || statusConfig.PENDENTE
  const Icon = config.icon

  // Configurações de tamanho
  const sizeConfig = {
    sm: {
      padding: 'px-2 py-1',
      fontSize: 'text-xs',
      iconSize: 'w-3 h-3'
    },
    md: {
      padding: 'px-3 py-1.5',
      fontSize: 'text-sm',
      iconSize: 'w-4 h-4'
    },
    lg: {
      padding: 'px-4 py-2',
      fontSize: 'text-base',
      iconSize: 'w-5 h-5'
    }
  }

  const currentSize = sizeConfig[size] || sizeConfig.md

  // Configurações de variante
  const variantConfig = {
    default: 'rounded-lg',
    pill: 'rounded-full',
    square: 'rounded-none'
  }

  const currentVariant = variantConfig[variant] || variantConfig.default

  // Classes base
  const baseClasses = `
    inline-flex items-center gap-2 font-medium
    ${config.bgColor} ${config.borderColor} ${config.textColor}
    ${currentSize.padding} ${currentSize.fontSize}
    ${currentVariant} border
    ${className}
  `

  // Renderizar badge simples
  if (variant === 'simple') {
    return (
      <span className={`
        inline-flex items-center gap-1.5 font-medium
        ${config.textColor} ${currentSize.fontSize}
        ${className}
      `}>
        {showIcon && <Icon className={currentSize.iconSize} />}
        {config.label}
      </span>
    )
  }

  // Renderizar badge completo
  return (
    <div className={baseClasses}>
      {showIcon && (
        <Icon className={currentSize.iconSize} />
      )}
      <span>{config.label}</span>
    </div>
  )
}

/**
 * StatusBadgeWithTooltip
 * 
 * Badge com tooltip adicional
 */
export function StatusBadgeWithTooltip({ 
  status, 
  size = 'md',
  showDescription = true,
  className = '',
  ...props 
}) {
  const config = {
    PENDENTE: {
      tooltip: 'Seu pedido foi recebido e está aguardando confirmação de pagamento.',
      details: ['Pedido criado', 'Aguardando pagamento']
    },
    PAGO: {
      tooltip: 'Pagamento confirmado! Seu pedido está sendo preparado para envio.',
      details: ['Pagamento confirmado', 'Em preparação']
    },
    PROCESSANDO: {
      tooltip: 'Seu pedido está em processo de separação e embalagem.',
      details: ['Em separação', 'Embalagem em andamento']
    },
    ENVIADO: {
      tooltip: 'Seu pedido foi enviado e está a caminho do endereço de entrega.',
      details: ['Pedido enviado', 'Em trânsito']
    },
    ENTREGUE: {
      tooltip: 'Seu pedido foi entregue com sucesso!',
      details: ['Entrega concluída', 'Pedido finalizado']
    },
    CANCELADO: {
      tooltip: 'Este pedido foi cancelado.',
      details: ['Pedido cancelado']
    }
  }

  const statusInfo = config[status] || config.PENDENTE

  return (
    <div className={`relative group ${className}`}>
      <StatusBadge status={status} size={size} {...props} />
      
      {/* Tooltip */}
      {showDescription && (
        <div className={`
          absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
          w-64 p-3 bg-gray-900 text-white text-sm rounded-lg
          opacity-0 invisible group-hover:opacity-100 group-hover:visible
          transition-all duration-200 z-10
        `}>
          <div className="font-medium mb-1">{statusInfo.tooltip}</div>
          <div className="space-y-1">
            {statusInfo.details.map((detail, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-gray-300">
                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                {detail}
              </div>
            ))}
          </div>
          
          {/* Seta do tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * StatusTimeline
 * 
 * Linha do tempo com múltiplos status
 */
export function StatusTimeline({ 
  currentStatus, 
  history = [],
  className = ''
}) {
  const statusOrder = ['PENDENTE', 'PAGO', 'PROCESSANDO', 'ENVIADO', 'ENTREGUE']
  const currentIndex = statusOrder.indexOf(currentStatus)

  const statusConfig = {
    PENDENTE: { icon: FiClock, label: 'Pendente' },
    PAGO: { icon: FiCheck, label: 'Pago' },
    PROCESSANDO: { icon: FiRefreshCw, label: 'Processando' },
    ENVIADO: { icon: FiTruck, label: 'Enviado' },
    ENTREGUE: { icon: FiPackage, label: 'Entregue' }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {statusOrder.map((status, index) => {
        const config = statusConfig[status]
        const isActive = index <= currentIndex
        const isCurrent = status === currentStatus
        const Icon = config.icon

        return (
          <div key={status} className="flex items-center gap-3">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full border-2
              ${isActive 
                ? 'bg-primary-600 border-primary-600 text-white' 
                : 'bg-gray-100 border-gray-300 text-gray-400'
              }
            `}>
              <Icon className="w-4 h-4" />
            </div>
            
            <div className="flex-1">
              <div className={`
                font-medium text-sm
                ${isActive ? 'text-gray-900' : 'text-gray-400'}
              `}>
                {config.label}
              </div>
              
              {isCurrent && history.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {history[history.length - 1]?.descricao}
                </div>
              )}
            </div>
            
            {isActive && index < statusOrder.length - 1 && (
              <div className="flex-1 h-0.5 bg-primary-200 ml-2" />
            )}
          </div>
        )
      })}
    </div>
  )
}