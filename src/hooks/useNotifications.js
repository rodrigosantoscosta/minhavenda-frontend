import { useState, useCallback, useEffect } from 'react'
import storageUtil from '../utils/storageUtil'
import logger from '../utils/logger'

const STORAGE_KEY = 'mv_notifications'
const MAX_NOTIFICATIONS = 20

/**
 * useNotifications
 *
 * Hook para gerenciar notificações in-app de pedidos.
 * Persiste no localStorage via storageUtil (max 20 itens).
 *
 * Tipos suportados: 'new_order' | 'status_change' | 'cancelled'
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState(() => {
    return storageUtil.getItem(STORAGE_KEY, [])
  })

  // Sincronizar para o localStorage sempre que o estado mudar
  useEffect(() => {
    storageUtil.setItem(STORAGE_KEY, notifications)
  }, [notifications])

  /**
   * Adicionar nova notificação
   * @param {{ type: string, title: string, message: string, orderId?: string }} notification
   */
  const addNotification = useCallback((notification) => {
    const newItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      orderId: notification.orderId || null,
      read: false,
      createdAt: new Date().toISOString(),
    }

    setNotifications((prev) => {
      // Inserir no início, manter apenas os últimos MAX_NOTIFICATIONS
      const updated = [newItem, ...prev].slice(0, MAX_NOTIFICATIONS)
      logger.info({ notificationId: newItem.id, type: newItem.type }, 'Notificação adicionada')
      return updated
    })

    return newItem.id
  }, [])

  /**
   * Marcar uma notificação específica como lida
   * @param {string} id
   */
  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    logger.debug({ notificationId: id }, 'Notificação marcada como lida')
  }, [])

  /**
   * Quantidade de notificações não lidas
   */
  const unreadCount = notifications.filter((n) => !n.read).length

  /**
   * Notificações ordenadas: não lidas primeiro, depois lidas
   */
  const sortedNotifications = [
    ...notifications.filter((n) => !n.read),
    ...notifications.filter((n) => n.read),
  ]

  /**
   * Limpar todas as notificações (utilitário de dev)
   */
  const clearAll = useCallback(() => {
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
