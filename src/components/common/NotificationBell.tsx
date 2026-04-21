import { useState, useRef, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiBell, FiPackage, FiXCircle, FiRefreshCw } from 'react-icons/fi'
import { useNotificationContext } from '../../contexts/NotificationContext'

interface NotificationItem {
  id: string | number
  orderId?: string | number
  type: 'new_order' | 'status_change' | 'cancelled'
  read: boolean
  title: string
  message: string
  createdAt: string
}

type TypeIconProps = {
  type: 'new_order' | 'status_change' | 'cancelled'
}

/**
 * Ícone de sino com badge de não lidas e dropdown de notificações de pedidos.
 * Deve ser renderizado apenas quando o usuário está autenticado.
 */
export default function NotificationBell(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead } = useNotificationContext()

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  // Clicar numa notificação: marcar como lida e navegar para o pedido
  function handleItemClick(notification: NotificationItem): void {
    markAsRead(notification.id)
    setOpen(false)
    if (notification.orderId) {
      navigate(`/pedido/${notification.orderId}`)
    }
  }

  // Ícone por tipo
  function TypeIcon({ type }: TypeIconProps): React.JSX.Element {
    if (type === 'cancelled') return <FiXCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
    if (type === 'status_change') return <FiRefreshCw className="w-4 h-4 text-primary-500 flex-shrink-0" />
    return <FiPackage className="w-4 h-4 text-primary-500 flex-shrink-0" />
  }

  // Formatar timestamp
  function timeAgo(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime()
    const minutes = Math.floor(diff / 60_000)
    if (minutes < 1) return 'agora'
    if (minutes < 60) return `${minutes}min atrás`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h atrás`
    const days = Math.floor(hours / 24)
    return `${days}d atrás`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botão do sino */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notificações"
      >
        <FiBell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-1.5 w-80 bg-white rounded-2xl shadow-dropdown z-50 overflow-hidden">
          {/* Header do dropdown */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Notificações</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full">
                {unreadCount} nova{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <FiBell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notif: NotificationItem) => (
                <button
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 items-start ${
                    !notif.read ? 'bg-primary-50 hover:bg-primary-100' : ''
                  }`}
                >
                  {/* Dot de não lida */}
                  <div className="mt-0.5">
                    {!notif.read && (
                      <span className="block w-2 h-2 rounded-full bg-primary-500 mt-1" />
                    )}
                    {notif.read && <span className="block w-2 h-2" />}
                  </div>

                  <TypeIcon type={notif.type} />

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-gray-900 ${!notif.read ? 'font-semibold' : ''}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 truncate">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200">
              <button
                onClick={() => { setOpen(false); navigate('/pedidos') }}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium w-full text-center py-1"
              >
                Ver todos os pedidos
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
