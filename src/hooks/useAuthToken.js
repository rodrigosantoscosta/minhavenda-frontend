import { useAuth } from '../contexts/AuthContext'
import authService from '../services/authService'
import logger from '../utils/logger'

/**
 * Custom hook that enhances useAuth with token validation
 * Ensures both AuthContext state AND localStorage token are valid
 */
export function useAuthToken() {
  const auth = useAuth()
  
  // Check if we have a valid token in localStorage
  const token = authService.getToken()
  const hasValidToken = token && 
                        token !== 'null' && 
                        token !== 'undefined' && 
                        authService.isTokenValid()
  
  // User is truly authenticated only if:
  // 1. AuthContext says so (isAuthenticated)
  // 2. AND we have a valid, non-expired token
  const isReallyAuthenticated = auth.isAuthenticated && hasValidToken
  
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
