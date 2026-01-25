import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Spinner } from './Loading'

/**
 * PROTECTED ROUTE
 * Componente que protege rotas que requerem autenticação
 * 
 * Uso:
 * <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
 */
export function ProtectedRoute({ children, requiredRole = null }) {
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
  return children
}

/**
 * ADMIN ROUTE
 * Componente que protege rotas que requerem perfil de ADMIN
 * 
 * Uso:
 * <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
 */
export function AdminRoute({ children }) {
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
export function PublicRoute({ children, redirectTo = '/' }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  return children
}

export default ProtectedRoute
