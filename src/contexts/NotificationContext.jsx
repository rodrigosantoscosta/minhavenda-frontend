import { createContext, useContext } from 'react'
import { useNotifications } from '../hooks/useNotifications'

const NotificationContext = createContext(null)

/**
 * NotificationProvider
 *
 * Disponibiliza o sistema de notificações de pedidos para toda a árvore de componentes.
 * Deve envolver o app abaixo de AuthProvider e CartProvider.
 */
export function NotificationProvider({ children }) {
  const notificationState = useNotifications()

  return (
    <NotificationContext.Provider value={notificationState}>
      {children}
    </NotificationContext.Provider>
  )
}

/**
 * useNotificationContext
 *
 * Hook de consumo do contexto de notificações.
 * Lança erro se usado fora do NotificationProvider.
 */
export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext deve ser usado dentro de NotificationProvider')
  }
  return context
}

export default NotificationContext
