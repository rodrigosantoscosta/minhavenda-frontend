import { useState, useCallback, useEffect } from 'react'
import storageUtil from '../utils/storageUtil'
import logger from '../utils/logger'

const STORAGE_KEY = 'mv_notifications'
const MAX_NOTIFICATIONS = 20

type NotificationType = 'new_order' | 'status_change' | 'cancelled'

interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  orderId: string | null
  read: boolean
  createdAt: string
}

interface AddNotificationPayload {
  type: NotificationType
  title: string
  message: string
  orderId?: string
}

interface UseNotificationsReturn {
  notifications: NotificationItem[]
  addNotification: (notification: AddNotificationPayload) => string
  markAsRead: (id: string) => void
  unreadCount: number
  clearAll: () => void
}

/**
 * useNotifications
 *
 * Hook para gerenciar notificações in-app de pedidos.
 * Persiste no localStorage via storageUtil (max 20 itens).
 *
 * Tipos suportados: 'new_order' | 'status_change' | 'cancelled'
 */
export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return storageUtil.getItem<NotificationItem[]>(STORAGE_KEY, [])
  })

  // Sincronizar para o localStorage sempre que o estado mudar
  useEffect(() => {
    storageUtil.setItem(STORAGE_KEY, notifications)
  }, [notifications])

  /**
   * Adicionar nova notificação
   */
  const addNotification = useCallback((notification: AddNotificationPayload): string => {
    const newItem: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      orderId: notification.orderId || null,
      read: false,
      createdAt: new Date().toISOString(),
    }

    setNotifications((prev: NotificationItem[]) => {
      // Inserir no início, manter apenas os últimos MAX_NOTIFICATIONS
      const updated: NotificationItem[] = [newItem, ...prev].slice(0, MAX_NOTIFICATIONS)
      logger.info({ notificationId: newItem.id, type: newItem.type }, 'Notificação adicionada')
      return updated
    })

    return newItem.id
  }, [])

  /**
   * Marcar uma notificação específica como lida
   */
  const markAsRead = useCallback((id: string): void => {
    setNotifications((prev: NotificationItem[]) =>
      prev.map((n: NotificationItem) => (n.id === id ? { ...n, read: true } : n))
    )
    logger.debug({ notificationId: id }, 'Notificação marcada como lida')
  }, [])

  /**
   * Quantidade de notificações não lidas
   */
  const unreadCount: number = notifications.filter((n: NotificationItem) => !n.read).length

  /**
   * Notificações ordenadas: não lidas primeiro, depois lidas
   */
  const sortedNotifications: NotificationItem[] = [
    ...notifications.filter((n: NotificationItem) => !n.read),
    ...notifications.filter((n: NotificationItem) => n.read),
  ]

  /**
   * Limpar todas as notificações (utilitário de dev)
   */
  const clearAll = useCallback((): void => {
    setNotifications([])
    storageUtil.removeItem(STORAGE_KEY)
    logger.debug('Todas as notificações removidas')
  }, [])

  return {
    notifications: sortedNotifications,
    addNotification,
    markAsRead,
    unreadCount,
    clearAll,
  }
}
