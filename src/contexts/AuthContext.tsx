import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import type { User } from '../types'
import authService from '../services/authService'
import jwtHelper from '../utils/jwtHelper'
import logger from '../utils/logger'

interface LoginResult {
  success: boolean
  user?: User
  message?: string
  error?: string
}

interface RegisterResult {
  success: boolean
  user?: User
  message?: string
  error?: string
}

interface GoogleLoginResult {
  success: boolean
  user?: User
  error?: string
}

interface LogoutResult {
  success: boolean
  message: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  tokenExpiresAt: number | null
  showExpirationWarning: boolean
  login: (email: string, senha: string) => Promise<LoginResult>
  register: (nome: string, email: string, senha: string) => Promise<RegisterResult>
  loginWithGoogle: (code: string) => Promise<GoogleLoginResult>
  logout: () => LogoutResult
  updateUser: (updatedUser: User) => void
  checkAuth: () => void
  handleTokenExpiration: (reason?: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // Estados para token
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null)
  const [showExpirationWarning, setShowExpirationWarning] = useState<boolean>(false)

  // useRef para evitar dependência circular
  const userRef = useRef<User | null>(user)

  // Atualizar ref quando user mudar
  useEffect(() => {
    userRef.current = user
  }, [user])

  // Remover 'user' das dependências
  const handleTokenExpiration = useCallback((reason: string = 'expired'): void => {
    logger.warn({
      userId: userRef.current?.id,
      reason,
      timestamp: new Date().toISOString()
    }, 'Token expired - automatic logout')

    // Fazer logout
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    setTokenExpiresAt(null)
    setShowExpirationWarning(false)

    // Notificar usuário
    // toast.warning('Sua sessão expirou. Faça login novamente.')

    // Redirecionar para login
    // navigate('/login')
  }, []) //  Array vazio - função estável

  // checkAuth com validação de expiração
  const checkAuth = useCallback((): void => {
    try {
      const token = authService.getToken()
      const savedUser = authService.getCurrentUser()

      if (token && savedUser) {
        // Verificar se token está expirado
        if (jwtHelper.isTokenExpired(token)) {
          logger.warn('Token expired on checkAuth')
          handleTokenExpiration('expired_on_load')
          return
        }

        // Autenticar usuário
        setUser(savedUser)
        setIsAuthenticated(true)

        // Armazenar timestamp de expiração
        const expiration = jwtHelper.getTokenExpiration(token)
        setTokenExpiresAt(expiration)

        // Log com tempo restante
        const timeLeft = (expiration ?? 0) - Date.now()
        const minutesLeft = Math.floor(timeLeft / 1000 / 60)

        logger.info({
          userId: savedUser.id,
          email: savedUser.email,
          expiresIn: `${minutesLeft} minutes`
        }, 'User authenticated from storage')
      } else {
        logger.debug('No authentication found in storage')
      }
    } catch (error) {
      logger.error({ error }, 'Error checking authentication')
      handleTokenExpiration('error')
    } finally {
      setLoading(false)
    }
  }, [handleTokenExpiration])

  // Verificar autenticação apenas uma vez no mount
  useEffect(() => {
    checkAuth()
  }, []) //Array vazio - executa apenas no mount

  // Monitorar expiração do token
  useEffect(() => {
    if (!isAuthenticated || !tokenExpiresAt) {
      return
    }

    logger.debug('Starting token expiration monitoring')

    // Verificar expiração a cada 1 minuto
    const interval = setInterval(() => {
      const now = Date.now()
      const timeLeft = tokenExpiresAt - now

      logger.debug({
        timeLeftMinutes: Math.floor(timeLeft / 1000 / 60)
      }, 'Token expiration check')

      // Token expirado
      if (timeLeft <= 0) {
        logger.warn('Token expired during interval check')
        handleTokenExpiration('expired_during_use')
        return
      }

      // Aviso 5 minutos antes (opcional)
      const fiveMinutes = 5 * 60 * 1000
      if (timeLeft <= fiveMinutes && !showExpirationWarning) {
        logger.info('Token expiring soon - showing warning')
        setShowExpirationWarning(true)
        // toast.warning('Sua sessão irá expirar em 5 minutos')
      }
    }, 60000) // 60 segundos

    // Cleanup
    return () => {
      logger.debug('Stopping token expiration monitoring')
      clearInterval(interval)
    }
  }, [isAuthenticated, tokenExpiresAt, showExpirationWarning, handleTokenExpiration])

  // Escutar evento de 401 do axios interceptor
  useEffect(() => {
    const handleUnauthorized = (): void => {
      logger.warn('Received unauthorized event from API')
      handleTokenExpiration('unauthorized_api_response')
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [handleTokenExpiration])

  // login com timestamp de expiração
  const login = useCallback(async (email: string, senha: string): Promise<LoginResult> => {
    try {
      logger.info({ email }, 'Attempting login')
      setLoading(true)

      const response = await authService.login(email, senha)

      logger.debug({
        hasToken: !!response.token,
        hasUser: !!response.user,
        hasNome: !!response.nome
      }, 'Login response received')

      // Extrair user da resposta
      let userData: User = response.user || {
        nome: response.nome,
        email: response.email,
        id: response.id,
        tipo: response.tipo,
        role: null
      }

      // Validar dados mínimos
      if (!userData.nome) {
        logger.error({ response }, 'Invalid server response - missing "nome" field')
        throw new Error('Resposta do servidor inválida: dados do usuário incompletos')
      }

      setUser(userData)
      setIsAuthenticated(true)

      // Armazenar timestamp de expiração
      const token = response.token
      const expiration = jwtHelper.getTokenExpiration(token)
      setTokenExpiresAt(expiration)
      setShowExpirationWarning(false) // Reset aviso

      const timeLeft = (expiration ?? 0) - Date.now()
      const minutesLeft = Math.floor(timeLeft / 1000 / 60)

      logger.info({
        userId: userData.id,
        email: userData.email,
        tipo: userData.tipo,
        tokenExpiresIn: `${minutesLeft} minutes`
      }, 'Login successful')

      return {
        success: true,
        user: userData,
        message: `Bem-vindo, ${userData.nome}!`
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { mensagem?: string; message?: string; error?: string }; statusText?: string }; message?: string }
      logger.error({
        error,
        status: err.response?.status,
        data: err.response?.data
      }, 'Login failed')


      let message = err.message || 'Erro ao fazer login'

      return { success: false, error: message }
    } finally {
      setLoading(false)
    }

  }, [])

  // register com timestamp de expiração
  const register = useCallback(async (nome: string, email: string, senha: string): Promise<RegisterResult> => {
    try {
      logger.info({ nome, email }, 'Attempting registration')
      setLoading(true)

      const response = await authService.register(nome, email, senha)

      logger.debug({
        hasToken: !!response.token,
        hasUser: !!response.user,
        hasNome: !!response.nome
      }, 'Registration response received')

      // Extrair user da resposta
      let userData: User = response.user || {
        nome: response.nome,
        email: response.email,
        id: response.id,
        tipo: response.tipo,
        role: null
      }

      // Validar dados mínimos
      if (!userData.nome) {
        logger.error({ response }, 'Invalid server response - missing "nome" field')
        throw new Error('Resposta do servidor inválida: dados do usuário incompletos')
      }

      setUser(userData)
      setIsAuthenticated(true)

      // Armazenar timestamp de expiração
      const token = response.token
      const expiration = jwtHelper.getTokenExpiration(token)
      setTokenExpiresAt(expiration)
      setShowExpirationWarning(false)

      const timeLeft = (expiration ?? 0) - Date.now()
      const minutesLeft = Math.floor(timeLeft / 1000 / 60)

      logger.info({
        userId: userData.id,
        email: userData.email,
        tipo: userData.tipo,
        tokenExpiresIn: `${minutesLeft} minutes`
      }, 'Registration successful')

      return {
        success: true,
        user: userData,
        message: 'Conta criada com sucesso!'
      }
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: { mensagem?: string; message?: string; error?: string }; statusText?: string }; request?: unknown; message?: string }
      logger.error({
        error,
        status: err.response?.status,
        data: err.response?.data
      }, 'Registration failed')

      let message = 'Erro ao criar conta'

      if (err.response) {
        message = err.response.data?.mensagem ||
          err.response.data?.message ||
          err.response.data?.error ||
          `Erro ${err.response.status}: ${err.response.statusText}`
      } else if (err.request) {
        message = 'Servidor não respondeu.'
      } else {
        message = err.message || 'Erro ao criar conta'
      }

      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Google OAuth — called by OAuthCallback page with the one-time code.
   * Delegates to authService.googleExchange(), then syncs auth state.
   */
  const loginWithGoogle = useCallback(async (code: string): Promise<GoogleLoginResult> => {
    try {
      logger.info('Attempting Google OAuth exchange')
      setLoading(true)

      const response = await authService.googleExchange(code)

      const userData = response.user
      if (!userData) {
        throw new Error('Resposta do servidor inválida: sem dados do usuário')
      }

      setUser(userData)
      setIsAuthenticated(true)

      const expiration = jwtHelper.getTokenExpiration(response.token)
      setTokenExpiresAt(expiration)
      setShowExpirationWarning(false)

      logger.info({ userId: userData.id, role: userData.role }, 'Google OAuth login successful')
      return { success: true, user: userData }
    } catch (error: unknown) {
      const err = error as { message?: string }
      logger.error({ error }, 'Google OAuth login failed')
      return { success: false, error: err.message || 'Falha no login com Google' }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback((): LogoutResult => {
    logger.info({ userId: userRef.current?.id }, 'User logging out')
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    setTokenExpiresAt(null)
    setShowExpirationWarning(false)
    logger.info('Logout successful - state cleared')
    return { success: true, message: 'Você saiu da sua conta' }
  }, [])

  const updateUser = useCallback((updatedUser: User): void => {
    if (!updatedUser) {
      logger.warn('Attempted to update user with null/undefined value')
      return
    }

    logger.info({ userId: updatedUser.id, changes: Object.keys(updatedUser) }, 'Updating user data')
    setUser(updatedUser)
    authService.updateCurrentUser(updatedUser)
    logger.debug({ updatedUser }, 'User data updated successfully')
  }, [])

  // Context value
  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    tokenExpiresAt,
    showExpirationWarning,
    login,
    register,
    loginWithGoogle,
    logout,
    updateUser,
    checkAuth,
    handleTokenExpiration,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

export default AuthContext
