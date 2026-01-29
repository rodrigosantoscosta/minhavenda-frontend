import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import authService from '../services/authService'
import jwtHelper from '../utils/jwtHelper'
import logger from '../utils/logger'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Estados para token
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null)
  const [showExpirationWarning, setShowExpirationWarning] = useState(false)

  // useRef para evitar dependência circular
  const userRef = useRef(user)

  // Atualizar ref quando user mudar
  useEffect(() => {
    userRef.current = user
  }, [user])

  // Remover 'user' das dependências
  const handleTokenExpiration = useCallback((reason = 'expired') => {
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
  }, []) // ✅ Array vazio - função estável

  // checkAuth com validação de expiração
  const checkAuth = useCallback(() => {
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
        const timeLeft = expiration - Date.now()
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
    const handleUnauthorized = () => {
      logger.warn('Received unauthorized event from API')
      handleTokenExpiration('unauthorized_api_response')
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [handleTokenExpiration])

  // login com timestamp de expiração
  const login = useCallback(async (email, senha) => {
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
      let userData = response.user || {
        nome: response.nome,
        email: response.email,
        id: response.id,
        tipo: response.tipo
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

      const timeLeft = expiration - Date.now()
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
    } catch (error) {
      logger.error({
        error,
        status: error.response?.status,
        data: error.response?.data
      }, 'Login failed')

      let message = 'Erro ao fazer login'

      if (error.response) {
        message = error.response.data?.message ||
                 error.response.data?.error ||
                 `Erro ${error.response.status}: ${error.response.statusText}`
      } else if (error.request) {
        message = 'Servidor não respondeu. Verifique se o backend está rodando.'
      } else {
        message = error.message
      }

      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  // register com timestamp de expiração
  const register = useCallback(async (nome, email, senha) => {
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
      let userData = response.user || {
        nome: response.nome,
        email: response.email,
        id: response.id,
        tipo: response.tipo
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

      const timeLeft = expiration - Date.now()
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
    } catch (error) {
      logger.error({
        error,
        status: error.response?.status,
        data: error.response?.data
      }, 'Registration failed')

      let message = 'Erro ao criar conta'

      if (error.response) {
        message = error.response.data?.message ||
                 error.response.data?.error ||
                 `Erro ${error.response.status}: ${error.response.statusText}`
      } else if (error.request) {
        message = 'Servidor não respondeu.'
      } else {
        message = error.message
      }

      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    logger.info({ userId: userRef.current?.id }, 'User logging out')
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    setTokenExpiresAt(null)
    setShowExpirationWarning(false)
    logger.info('Logout successful - state cleared')
    return { success: true, message: 'Você saiu da sua conta' }
  }, [])

  const updateUser = useCallback((updatedUser) => {
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
  const value = {
    user,
    loading,
    isAuthenticated,
    tokenExpiresAt,
    showExpirationWarning,
    login,
    register,
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

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider')
  }
  return context
}

export default AuthContext