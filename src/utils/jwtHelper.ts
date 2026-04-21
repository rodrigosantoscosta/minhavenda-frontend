import logger from './logger'

/**
 * Utility for parsing and validating JWT tokens
 * Only decodes the payload (no signature validation)
 */
interface JwtPayload {
  sub?: string | number
  email?: string
  role?: string
  exp?: number
  [key: string]: unknown
}

const jwtHelper = {
  /**
   * Decode the payload of a JWT token
   * @param token - JWT token string
   * @returns Decoded payload or null if invalid
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      if (!token || typeof token !== 'string') {
        logger.warn('Invalid token: not a string')
        return null
      }

      // JWT has format: header.payload.signature
      const parts = token.split('.')

      if (parts.length !== 3) {
        logger.warn('Invalid JWT format: expected 3 parts')
        return null
      }

      // Decode payload (second part)
      const payload = parts[1]

      // Decode base64url
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
   * Check if the token is expired
   * @param token - JWT token string
   * @returns true if expired, false otherwise
   */
  isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token)

    if (!payload || !payload.exp) {
      logger.warn('Token has no expiration field')
      return true // Consider invalid if no exp
    }

    const now = Math.floor(Date.now() / 1000) // Timestamp in seconds
    const isExpired = payload.exp <= now

    if (isExpired) {
      logger.debug({ exp: payload.exp, now }, 'Token is expired')
    }

    return isExpired
  },

  /**
   * Get the expiration timestamp in milliseconds
   * @param token - JWT token string
   * @returns Expiration timestamp or null
   */
  getTokenExpiration(token: string): number | null {
    const payload = this.decodeToken(token)

    if (!payload || !payload.exp) {
      return null
    }

    // Convert from seconds to milliseconds
    return payload.exp * 1000
  },

  /**
   * Calculate the time remaining until expiration in milliseconds
   * @param token - JWT token string
   * @returns Milliseconds remaining or null
   */
  getTimeUntilExpiration(token: string): number | null {
    const expiration = this.getTokenExpiration(token)

    if (!expiration) {
      return null
    }

    const timeLeft = expiration - Date.now()
    return Math.max(0, timeLeft) // Never return negative
  },

  /**
   * Get the expiration date as a Date object
   * @param token - JWT token string
   * @returns Expiration date or null
   */
  getExpirationDate(token: string): Date | null {
    const expiration = this.getTokenExpiration(token)

    if (!expiration) {
      return null
    }

    return new Date(expiration)
  }
}

export default jwtHelper
