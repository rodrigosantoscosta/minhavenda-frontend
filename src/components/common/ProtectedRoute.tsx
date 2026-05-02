import { useState, useEffect, type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Spinner } from './Loading'
import type { UserRole } from '../../types'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: UserRole | null
}

interface PublicRouteProps {
  children: ReactNode
  redirectTo?: string
}

/**
 * PROTECTED ROUTE
 * Componente que protege rotas que requerem autenticação
 *
 * Uso:
 * <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
 */
export function ProtectedRoute({ children, requiredRole = null }: ProtectedRouteProps): React.JSX.Element {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    // Salvar a localização atual para redirecionar depois do login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Se requerer role específica, verificar
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  // Está autenticado, renderizar children
  return <>{children}</>
}

/**
 * ADMIN ROUTE
 * Componente que protege rotas que requerem perfil de ADMIN
 *
 * Uso:
 * <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
 */
export function AdminRoute({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      {children}
    </ProtectedRoute>
  )
}

/**
 * PUBLIC ROUTE
 * Rota pública que redireciona se já estiver autenticado
 * (Ex: página de login - se já logado, vai para home)
 *
 * Uso:
 * <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
 */
export function PublicRoute({ children, redirectTo = '/' }: PublicRouteProps): React.JSX.Element {
  const { isAuthenticated, loading } = useAuth()

  // Only show spinner on initial auth check, not during login
  const [initialCheck, setInitialCheck] = useState(true)

  useEffect(() => {
    if (!loading) {
      setInitialCheck(false)
    }
  }, [loading])

  // Only show spinner during first mount check
  if (loading && initialCheck) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return <>{children}</>
}


export default ProtectedRoute
