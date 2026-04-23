import { useAuth } from '../contexts/AuthContext'
import authService from '../services/authService'
import logger from '../utils/logger'

interface AuthContextValue {
  user: import('../types').User | null
  loading: boolean
  isAuthenticated: boolean
  tokenExpiresAt: number | null
  showExpirationWarning: boolean
  login: (email: string, senha: string) => Promise<{ success: boolean; user?: import('../types').User; message?: string; error?: string }>
  register: (nome: string, email: string, senha: string) => Promise<{ success: boolean; user?: import('../types').User; message?: string; error?: string }>
  loginWithGoogle: (code: string) => Promise<{ success: boolean; user?: import('../types').User; error?: string }>
  logout: () => { success: boolean; message: string }
  updateUser: (updatedUser: import('../types').User) => void
  checkAuth: () => void
  handleTokenExpiration: (reason?: string) => void
}

interface UseAuthTokenReturn extends AuthContextValue {
  isAuthenticated: boolean
  hasValidToken: boolean
  token: string | null
}

/**
 * Custom hook that enhances useAuth with token validation
 * Ensures both AuthContext state AND localStorage token are valid
 */
export function useAuthToken(): UseAuthTokenReturn {
  const auth = useAuth() as AuthContextValue

  // Check if we have a valid token in localStorage
  const token: string | null = authService.getToken()
  const hasValidToken: boolean = token !== null &&
                        token !== 'null' &&
                        token !== 'undefined' &&
                        authService.isTokenValid()

  // User is truly authenticated only if:
  // 1. AuthContext says so (isAuthenticated)
  // 2. AND we have a valid, non-expired token
  const isReallyAuthenticated: boolean = auth.isAuthenticated && hasValidToken

  logger.debug({
    contextAuth: auth.isAuthenticated,
    hasToken: !!token,
    tokenValid: hasValidToken,
    reallyAuth: isReallyAuthenticated
  }, 'useAuthToken check')

  return {
    ...auth,
    isAuthenticated: isReallyAuthenticated,
    hasValidToken,
    token
  }
}

export default useAuthToken
