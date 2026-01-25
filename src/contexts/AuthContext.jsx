import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authService from '../services/authService'
import logger from '../utils/logger'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar autenticação ao montar
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = useCallback(() => {
    try {
      const token = authService.getToken()
      const savedUser = authService.getCurrentUser()
      
      if (token && savedUser) {
        setUser(savedUser)
        setIsAuthenticated(true)
        logger.info({ userId: savedUser.id, email: savedUser.email }, 'User authenticated from storage')
      } else {
        logger.debug('No authentication found in storage')
      }
    } catch (error) {
      logger.error({ error }, 'Error checking authentication')
      authService.logout()
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

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
      // Backend pode retornar: { token, user } ou { token, nome, email, ... }
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
      
      logger.info({ 
        userId: userData.id, 
        email: userData.email,
        tipo: userData.tipo 
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
        // Erro da API
        message = error.response.data?.message || 
                 error.response.data?.error ||
                 `Erro ${error.response.status}: ${error.response.statusText}`
      } else if (error.request) {
        // Requisição enviada mas sem resposta
        message = 'Servidor não respondeu. Verifique se o backend está rodando.'
      } else {
        // Erro na configuração da requisição
        message = error.message
      }
      
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

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
      
      logger.info({ 
        userId: userData.id, 
        email: userData.email,
        tipo: userData.tipo 
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
    logger.info({ userId: user?.id }, 'User logging out')
    
    authService.logout()
    setUser(null)
    setIsAuthenticated(false)
    
    logger.info('Logout successful - state cleared')
    
    return { success: true, message: 'Você saiu da sua conta' }
  }, [user])

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

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    checkAuth,
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