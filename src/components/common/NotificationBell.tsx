import React, { useState, useRef, useEffect } from 'react'
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

type TypeIconProps = { type: NotificationItem['type'] }

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  return `${Math.floor(hours / 24)}d atrás`
}

export default function NotificationBell(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead } = useNotificationContext()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function handleItemClick(notification: NotificationItem): void {
    markAsRead(String(notification.id))
    setOpen(false)
    if (notification.orderId) navigate(`/pedido/${notification.orderId}`)
  }

  function TypeIcon({ type }: TypeIconProps): React.JSX.Element {
    if (type === 'cancelled')    return <FiXCircle    className="w-4 h-4 text-destructive shrink-0" />
    if (type === 'status_change') return <FiRefreshCw  className="w-4 h-4 text-foreground shrink-0" />
    return                               <FiPackage    className="w-4 h-4 text-foreground shrink-0" />
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button — min 40×40 hit area */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors duration-150"
        aria-label="Notificações"
      >
        <FiBell className="w-5 h-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-display font-bold rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center tabular-nums px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-1.5 w-80 bg-card rounded-xl shadow-dropdown border border-border z-50 overflow-hidden animate-fadeInUp origin-top-right">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-display font-semibold text-foreground">Notificações</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-destructive/10 text-destructive font-medium px-2 py-0.5 rounded-full font-sans">
                {unreadCount} nova{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <FiBell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground font-sans">Nenhuma notificação</p>
              </div>
            ) : (
              (notifications as NotificationItem[]).map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={[
                    'w-full text-left px-4 py-3 flex gap-3 items-start',
                    'transition-colors duration-100',
                    notif.read
                      ? 'hover:bg-muted/60'
                      : 'bg-muted hover:bg-muted/70',
                  ].join(' ')}
                >
                  {/* Unread dot */}
                  <div className="mt-1 shrink-0 w-2">
                    {!notif.read && (
                      <span className="block w-2 h-2 rounded-full bg-foreground" />
                    )}
                  </div>

                  <TypeIcon type={notif.type} />

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm text-foreground font-sans ${!notif.read ? 'font-semibold' : 'font-medium'}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground font-sans mt-0.5 truncate">
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground/60 font-sans mt-1 tabular-nums">
                      {timeAgo(notif.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-border">
              <button
                onClick={() => { setOpen(false); navigate('/pedidos') }}
                className="text-xs text-foreground hover:text-foreground/70 font-display font-semibold w-full text-center py-1 transition-colors duration-150"
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
