import { createContext, useContext, useState, useCallback } from 'react'
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiAlertTriangle } from 'react-icons/fi'

const ToastContext = createContext()

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

/**
 * ToastProvider
 * 
 * Adicione no App.jsx:
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ type = 'info', message, duration = 5000 }) => {
    const id = Date.now()
    const toast = { id, type, message, duration }
    
    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback((message, duration) => {
    return addToast({ type: 'success', message, duration })
  }, [addToast])

  const error = useCallback((message, duration) => {
    return addToast({ type: 'error', message, duration })
  }, [addToast])

  const warning = useCallback((message, duration) => {
    return addToast({ type: 'warning', message, duration })
  }, [addToast])

  const info = useCallback((message, duration) => {
    return addToast({ type: 'info', message, duration })
  }, [addToast])

  const value = {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

/**
 * ToastContainer
 */
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

/**
 * Toast Component
 */
function Toast({ type, message, onClose }) {
  const config = {
    success: {
      icon: <FiCheckCircle className="w-5 h-5" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      textColor: 'text-green-800',
      iconColor: 'text-green-500',
    },
    error: {
      icon: <FiAlertCircle className="w-5 h-5" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500',
      textColor: 'text-red-800',
      iconColor: 'text-red-500',
    },
    warning: {
      icon: <FiAlertTriangle className="w-5 h-5" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-800',
      iconColor: 'text-yellow-500',
    },
    info: {
      icon: <FiInfo className="w-5 h-5" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-500',
    },
  }

  const { icon, bgColor, borderColor, textColor, iconColor } = config[type]

  return (
    <div
      className={`
        ${bgColor} ${borderColor} ${textColor}
        border-l-4 rounded-lg shadow-lg p-4
        flex items-start space-x-3
        animate-slideIn
      `}
    >
      <div className={iconColor}>
        {icon}
      </div>
      
      <div className="flex-1">
        <p className="text-sm font-medium">
          {message}
        </p>
      </div>

      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <FiX className="w-5 h-5" />
      </button>
    </div>
  )
}

/**
 * Exemplo de uso:
 * 
 * const toast = useToast()
 * 
 * toast.success('Produto adicionado ao carrinho!')
 * toast.error('Erro ao processar pagamento')
 * toast.warning('Estoque baixo')
 * toast.info('Produto atualizado')
 */
