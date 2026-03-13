import api from './api'
import jwtHelper from '../utils/jwtHelper'
import logger from '../utils/logger'

/**
 * Decodes the JWT and returns a fully-enriched user object.
 * The NestJS backend embeds { sub, email, role } in the JWT payload.
 * AuthResponseDto only returns { token, email, nome } — role must come from the payload.
 * AdminRoute checks user.role === 'ADMIN', so this field is mandatory.
 */
function buildUser(token, overrides = {}) {
  const payload = jwtHelper.decodeToken(token)
  return {
    id: payload?.sub ?? null,
    nome: overrides.nome ?? null,
    email: overrides.email ?? payload?.email ?? null,
    role: payload?.role ?? null,  // 'ADMIN' | 'CLIENTE'
    tipo: payload?.role ?? null,  // alias for compatibility
    ...overrides,
  }
}

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

      // All response formats — build user from JWT payload to get role
      if (data.token) {
        const user = buildUser(data.token, {
          nome: data.user?.nome ?? data.nome ?? null,
          email: data.user?.email ?? data.email ?? email,
          id: data.user?.id ?? data.id ?? null,
        })

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(user))

        const expiration = jwtHelper.getTokenExpiration(data.token)
        if (expiration) {
          localStorage.setItem('tokenExpiration', expiration.toString())
          logger.debug({ expiration }, 'Token expiration saved')
        }

        logger.info({ role: user.role }, 'Login: user role extracted from JWT')
        return { token: data.token, user }
      }

      throw new Error('Resposta do servidor inválida: sem token')
    } catch (error) {
      logger.error({ error }, 'Erro no authService.login')

        if(error.response?.data?.mensagem) {
          // Backend retornou mensagem em português
          const errorMsg = error.response.data.mensagem
          logger.debug({ errorMsg }, 'Extracted error message from response')
          throw new Error(errorMsg)
        } else if (error.response?.data?.message) {
          // Backend retornou mensagem em inglês
          throw new Error(error.response.data.message)
        } else if (error.response?.status === 401) {
          throw new Error('Email ou senha inválidos')
        } else if (error.response?.status) {
          throw new Error(`Erro do servidor: ${error.response.status}`)
        } else if (error.message) {
          throw new Error(error.message)
        } else {
          throw new Error('Erro ao fazer login')
        }
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

      // All response formats — build user from JWT payload to get role
      if (data.token) {
        const user = buildUser(data.token, {
          nome: data.user?.nome ?? data.nome ?? nome ?? null,
          email: data.user?.email ?? data.email ?? email,
          id: data.user?.id ?? data.id ?? null,
        })

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(user))

        const expiration = jwtHelper.getTokenExpiration(data.token)
        if (expiration) {
          localStorage.setItem('tokenExpiration', expiration.toString())
          logger.debug({ expiration }, 'Token expiration saved')
        }

        logger.info({ role: user.role }, 'Register: user role extracted from JWT')
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
    localStorage.removeItem('tokenExpiration') 
    logger.info('localStorage limpo')
  },

  /**
   * Verificar se usuário está autenticado 
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

  getTokenExpirationTime() {
    const token = this.getToken()
    if (!token) return null

    return jwtHelper.getTimeUntilExpiration(token)
  },


  getTokenExpiration() {
    const token = this.getToken()
    if (!token) return null

    return jwtHelper.getTokenExpiration(token)
  },

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
