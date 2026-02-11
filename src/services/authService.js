import api from './api'
import jwtHelper from '../utils/jwtHelper'
import logger from '../utils/logger'

const authService = {
  /**
   * Login do usuário
   */
  async login(email, senha) {
    try {
      logger.debug({ email }, 'authService.login chamado')

      const response = await api.post('/auth/login', {
        email,
        senha
      })

      logger.debug({ hasToken: !!response.data.token }, 'Resposta da API recebida')

      const data = response.data

      // Formato 1: { token, user: { nome, email, ... } }
      if (data.token && data.user) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        // ✨ NOVO: Armazenar timestamp de expiração
        const expiration = jwtHelper.getTokenExpiration(data.token)
        if (expiration) {
          localStorage.setItem('tokenExpiration', expiration.toString())
          logger.debug({ expiration }, 'Token expiration saved')
        }

        return data
      }

      // Formato 2: { token, nome, email, ... }
      if (data.token && data.nome) {
        const user = {
          id: data.id,
          nome: data.nome,
          email: data.email,
          tipo: data.tipo
        }

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(user))

        // ✨ NOVO: Armazenar timestamp de expiração
        const expiration = jwtHelper.getTokenExpiration(data.token)
        if (expiration) {
          localStorage.setItem('tokenExpiration', expiration.toString())
          logger.debug({ expiration }, 'Token expiration saved')
        }

        return { token: data.token, user }
      }

      // Formato 3: Somente token
      if (data.token) {
        localStorage.setItem('token', data.token)
        const user = { email }
        localStorage.setItem('user', JSON.stringify(user))

        // ✨ NOVO: Armazenar timestamp de expiração
        const expiration = jwtHelper.getTokenExpiration(data.token)
        if (expiration) {
          localStorage.setItem('tokenExpiration', expiration.toString())
          logger.debug({ expiration }, 'Token expiration saved')
        }

        logger.warn('Backend retornou apenas token, criando user básico')
        return { token: data.token, user }
      }

      throw new Error('Resposta do servidor inválida: sem token')
    } catch (error) {
      logger.error({ error }, 'Erro no authService.login')
      throw error
    }
  },

  /**
   * Registro de novo usuário
   */
  async register(nome, email, senha) {
    try {
      logger.debug({ nome, email }, 'authService.register chamado')

      const response = await api.post('/auth/register', {
        nome,
        email,
        senha
      })

      logger.debug({ hasToken: !!response.data.token }, 'Resposta da API recebida')

      const data = response.data

      // Formato 1: { token, user: { nome, email, ... } }
      if (data.token && data.user) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        // ✨ NOVO: Armazenar timestamp de expiração
        const expiration = jwtHelper.getTokenExpiration(data.token)
        if (expiration) {
          localStorage.setItem('tokenExpiration', expiration.toString())
          logger.debug({ expiration }, 'Token expiration saved')
        }

        return data
      }

      // Formato 2: { token, nome, email, ... }
      if (data.token && data.nome) {
        const user = {
          id: data.id,
          nome: data.nome,
          email: data.email,
          tipo: data.tipo
        }

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(user))

        // ✨ NOVO: Armazenar timestamp de expiração
        const expiration = jwtHelper.getTokenExpiration(data.token)
        if (expiration) {
          localStorage.setItem('tokenExpiration', expiration.toString())
          logger.debug({ expiration }, 'Token expiration saved')
        }

        return { token: data.token, user }
      }

      // Formato 3: Somente token
      if (data.token) {
        localStorage.setItem('token', data.token)
        const user = { nome, email }
        localStorage.setItem('user', JSON.stringify(user))

        // ✨ NOVO: Armazenar timestamp de expiração
        const expiration = jwtHelper.getTokenExpiration(data.token)
        if (expiration) {
          localStorage.setItem('tokenExpiration', expiration.toString())
          logger.debug({ expiration }, 'Token expiration saved')
        }

        logger.warn('Backend retornou apenas token, criando user básico')
        return { token: data.token, user }
      }

      throw new Error('Resposta do servidor inválida: sem token')
    } catch (error) {
      logger.error({ error }, 'Erro no authService.register')
      throw error
    }
  },

  /**
   * Logout do usuário
   */
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('tokenExpiration') // ✨ NOVO
    logger.info('localStorage limpo')
  },

  /**
   * Verificar se usuário está autenticado (✨ MODIFICADO)
   */
  isAuthenticated() {
    const token = this.getToken()
    if (!token) return false

    // Verificar se token está expirado
    return !jwtHelper.isTokenExpired(token)
  },

  /**
   * ✨ NOVO: Verificar se token é válido
   */
  isTokenValid() {
    const token = this.getToken()
    if (!token) return false

    return !jwtHelper.isTokenExpired(token)
  },

  /**
   * ✨ NOVO: Obter tempo até expiração
   */
  getTokenExpirationTime() {
    const token = this.getToken()
    if (!token) return null

    return jwtHelper.getTimeUntilExpiration(token)
  },

  /**
   * ✨ NOVO: Obter timestamp de expiração
   */
  getTokenExpiration() {
    const token = this.getToken()
    if (!token) return null

    return jwtHelper.getTokenExpiration(token)
  },

  /**
   * ✨ NOVO: Verificar se deve mostrar aviso de expiração (5 min antes)
   */
  shouldShowExpirationWarning() {
    const timeLeft = this.getTokenExpirationTime()
    if (!timeLeft) return false

    const fiveMinutes = 5 * 60 * 1000
    return timeLeft <= fiveMinutes && timeLeft > 0
  },

  /**
   * Obter usuário logado
   */
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch (error) {
      logger.error({ error }, 'Erro ao parsear user do localStorage')
      return null
    }
  },

  /**
   * Obter token
   */
  getToken() {
    return localStorage.getItem('token')
  },

  /**
   * Atualizar dados do usuário no localStorage
   */
  updateCurrentUser(updatedUser) {
    try {
      localStorage.setItem('user', JSON.stringify(updatedUser))
      logger.info({ userId: updatedUser.id }, 'User atualizado no localStorage')
    } catch (error) {
      logger.error({ error }, 'Erro ao atualizar usuário')
    }
  }
}

export default authService
