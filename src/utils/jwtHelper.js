import logger from './logger'

/**
 * Utilitário para manipular e validar JWT
 * Decodifica apenas o payload (sem validar assinatura)
 */
const jwtHelper = {
  /**
   * Decodifica o payload de um JWT
   * @param {string} token - Token JWT
   * @returns {object|null} - Payload decodificado ou null se inválido
   */
  decodeToken(token) {
    try {
      if (!token || typeof token !== 'string') {
        logger.warn('Invalid token: not a string')
        return null
      }

      // JWT tem formato: header.payload.signature
      const parts = token.split('.')

      if (parts.length !== 3) {
        logger.warn('Invalid JWT format: expected 3 parts')
        return null
      }

      // Decodificar payload (segunda parte)
      const payload = parts[1]

      // Decodificar base64url
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )

      return JSON.parse(jsonPayload)
    } catch (error) {
      logger.error({ error }, 'Error decoding JWT token')
      return null
    }
  },

  /**
   * Verifica se o token está expirado
   * @param {string} token - Token JWT
   * @returns {boolean} - true se expirado, false caso contrário
   */
  isTokenExpired(token) {
    const payload = this.decodeToken(token)

    if (!payload || !payload.exp) {
      logger.warn('Token has no expiration field')
      return true // Considerar inválido se não tem exp
    }

    const now = Math.floor(Date.now() / 1000) // Timestamp em segundos
    const isExpired = payload.exp <= now

    if (isExpired) {
      logger.debug({ exp: payload.exp, now }, 'Token is expired')
    }

    return isExpired
  },

  /**
   * Obtém o timestamp de expiração em milissegundos
   * @param {string} token - Token JWT
   * @returns {number|null} - Timestamp de expiração ou null
   */
  getTokenExpiration(token) {
    const payload = this.decodeToken(token)

    if (!payload || !payload.exp) {
      return null
    }

    // Converter de segundos para milissegundos
    return payload.exp * 1000
  },

  /**
   * Calcula o tempo restante até a expiração em milissegundos
   * @param {string} token - Token JWT
   * @returns {number|null} - Milissegundos restantes ou null
   */
  getTimeUntilExpiration(token) {
    const expiration = this.getTokenExpiration(token)

    if (!expiration) {
      return null
    }

    const timeLeft = expiration - Date.now()
    return Math.max(0, timeLeft) // Nunca retornar negativo
  },

  /**
   * Obtém a data de expiração como objeto Date
   * @param {string} token - Token JWT
   * @returns {Date|null} - Data de expiração ou null
   */
  getExpirationDate(token) {
    const expiration = this.getTokenExpiration(token)

    if (!expiration) {
      return null
    }

    return new Date(expiration)
  }
}

export default jwtHelper
