import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiAlertTriangle } from 'react-icons/fi'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: number
  type: ToastType
  message: string
  duration: number
}

interface ToastContextType {
  toasts: ToastItem[]
  addToast: (toast: { type: ToastType; message: string; duration?: number }) => number
  removeToast: (id: number) => void
  success: (message: string, duration?: number) => number
  error: (message: string, duration?: number) => number
  warning: (message: string, duration?: number) => number
  info: (message: string, duration?: number) => number
}

interface ToastProviderProps {
  children: ReactNode
}

interface ToastComponentProps {
  type: ToastType
  message: string
  onClose: () => void
}

interface ToastConfig {
  icon: ReactNode
  bgColor: string
  borderColor: string
  textColor: string
  iconColor: string
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

/**
 * ToastProvider
 *
 * Adicione no App.tsx:
 * <ToastProvider>
 *   <App />
 * </ToastProvider>
 */
export function ToastProvider({ children }: ToastProviderProps): React.JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback(({ type = 'info', message, duration = 5000 }: { type?: ToastType; message: string; duration?: number }): number => {
    const id = Date.now()
    const toast: ToastItem = { id, type, message, duration }

    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: number): void => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const success = useCallback((message: string, duration?: number): number => {
    return addToast({ type: 'success', message, duration })
  }, [addToast])

  const error = useCallback((message: string, duration?: number): number => {
    return addToast({ type: 'error', message, duration })
  }, [addToast])

  const warning = useCallback((message: string, duration?: number): number => {
    return addToast({ type: 'warning', message, duration })
  }, [addToast])

  const info = useCallback((message: string, duration?: number): number => {
    return addToast({ type: 'info', message, duration })
  }, [addToast])

  const value: ToastContextType = {
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
function ToastContainer({ toasts, removeToast }: { toasts: ToastItem[]; removeToast: (id: number) => void }): React.JSX.Element {
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
function Toast({ type, message, onClose }: ToastComponentProps): React.JSX.Element {
  const config: Record<ToastType, ToastConfig> = {
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
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-500',
      textColor: 'text-primary-900',
      iconColor: 'text-primary-600',
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
