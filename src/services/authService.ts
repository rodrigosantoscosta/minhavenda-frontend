import axios from 'axios'
import api from './api'
import jwtHelper from '../utils/jwtHelper'
import logger from '../utils/logger'
import type { User, LoginRequest, RegisterRequest, AuthResponse, TokenPair } from '../types'

interface LoginResult {
  token: string
  refreshToken: string
  user: User
  nome?: string
  email?: string
  id?: string | number
  tipo?: string
  role?: string
}

interface JwtPayload {
  sub?: string | number
  email?: string
  role?: string
  [key: string]: unknown
}

/**
 * Decodes the JWT and returns a fully-enriched user object.
 * The NestJS backend embeds { sub, email, role } in the JWT payload.
 * AuthResponseDto returns { accessToken, refreshToken, email, nome }.
 * AdminRoute checks user.role === 'ADMIN', so this field is mandatory.
 */
function buildUser(token: string, overrides: Partial<User> = {}): User {
  const payload = jwtHelper.decodeToken(token) as JwtPayload | null
  return {
    id: payload?.sub ?? null,
    nome: overrides.nome ?? null,
    email: overrides.email ?? payload?.email ?? null,
    role: (payload?.role as User['role']) ?? null,  // 'ADMIN' | 'CLIENTE'
    tipo: (payload?.role as User['role']) ?? null,  // alias for compatibility
    ...overrides,
  }
}

/**
 * Persist a full token pair + user to localStorage.
 * Single source of truth — every auth path calls this.
 */
function persistSession(accessToken: string, refreshToken: string, userOverrides: Partial<User> = {}): User {
  const user = buildUser(accessToken, userOverrides)
  localStorage.setItem('token', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
  localStorage.setItem('user', JSON.stringify(user))
  const expiration = jwtHelper.getTokenExpiration(accessToken)
  if (expiration) {
    localStorage.setItem('tokenExpiration', expiration.toString())
  }
  return user
}

interface AuthService {
  login(email: string, senha: string): Promise<LoginResult>
  register(nome: string, email: string, senha: string): Promise<LoginResult>
  googleExchange(code: string): Promise<LoginResult>
  refreshTokens(): Promise<TokenPair>
  logout(): void
  isAuthenticated(): boolean
  isTokenValid(): boolean
  getTokenExpirationTime(): number | null
  getTokenExpiration(): number | null
  shouldShowExpirationWarning(): boolean
  getCurrentUser(): User | null
  getToken(): string | null
  updateCurrentUser(updatedUser: User): void
}

const authService: AuthService = {
  /**
   * Login do usuário (email + senha)
   * Backend returns AuthResponseDto: { accessToken, refreshToken, email, nome }
   */
  async login(email: string, senha: string): Promise<LoginResult> {
    try {
      logger.debug({ email }, 'authService.login chamado')

      const response = await api.post<AuthResponse>('/auth/login', { email, senha })
      const data = response.data

      if (data.accessToken) {
        const user = persistSession(data.accessToken, data.refreshToken, {
          nome: data.nome ?? null,
          email: data.email ?? email,
        })
        logger.info({ role: user.role }, 'Login: user role extracted from JWT')
        return { token: data.accessToken, refreshToken: data.refreshToken, user }
      }

      throw new Error('Resposta do servidor inválida: sem token')
    } catch (error) {
      logger.error({ error }, 'Erro no authService.login')
      if ((error as { response?: { data?: { mensagem?: string; message?: string }; status?: number } }).response?.data?.mensagem) {
        throw new Error((error as { response: { data: { mensagem: string } } }).response.data.mensagem)
      } else if ((error as { response?: { data?: { message?: string } } }).response?.data?.message) {
        throw new Error((error as { response: { data: { message: string } } }).response.data.message)
      } else if ((error as { response?: { status?: number } }).response?.status === 401) {
        throw new Error('Email ou senha inválidos')
      } else if ((error as { response?: { status?: number } }).response?.status) {
        throw new Error(`Erro do servidor: ${(error as { response: { status: number } }).response.status}`)
      } else {
        throw new Error((error as Error).message || 'Erro ao fazer login')
      }
    }
  },

  /**
   * Registro de novo usuário
   * Backend returns AuthResponseDto: { accessToken, refreshToken, email, nome }
   */
  async register(nome: string, email: string, senha: string): Promise<LoginResult> {
    try {
      logger.debug({ nome, email }, 'authService.register chamado')

      const response = await api.post<AuthResponse>('/auth/register', { nome, email, senha } satisfies RegisterRequest)
      const data = response.data

      if (data.accessToken) {
        const user = persistSession(data.accessToken, data.refreshToken, {
          nome: data.nome ?? nome ?? null,
          email: data.email ?? email,
        })
        logger.info({ role: user.role }, 'Register: user role extracted from JWT')
        return { token: data.accessToken, refreshToken: data.refreshToken, user }
      }

      throw new Error('Resposta do servidor inválida: sem token')
    } catch (error) {
      logger.error({ error }, 'Erro no authService.register')
      throw error
    }
  },

  /**
   * Google OAuth — exchange one-time code for token pair.
   * Called by OAuthCallback page after backend redirects with ?code=<uuid>.
   * Backend: POST /auth/google/exchange → TokenPair { accessToken, refreshToken }
   * (TokenPair does NOT include nome/email — we decode from JWT payload only)
   */
  async googleExchange(code: string): Promise<LoginResult> {
    try {
      logger.debug({ code }, 'authService.googleExchange chamado')

      const response = await api.post<TokenPair>('/auth/google/exchange', { code })
      const { accessToken, refreshToken } = response.data

      if (!accessToken) {
        throw new Error('Resposta do servidor inválida: sem token')
      }

      const user = persistSession(accessToken, refreshToken)
      logger.info({ role: user.role }, 'Google OAuth: sessão iniciada')
      return { token: accessToken, refreshToken, user }
    } catch (error) {
      logger.error({ error }, 'Erro no authService.googleExchange')
      if ((error as { response?: { status?: number } }).response?.status === 401) {
        throw new Error('Código OAuth inválido, expirado ou já utilizado')
      }
      throw new Error((error as Error).message || 'Falha no login com Google')
    }
  },

  /**
   * Silently rotate the refresh token and persist the new pair.
   * Called by the api.js 401 interceptor before giving up.
   * Backend: POST /auth/refresh { refreshToken } → TokenPair
   * The route is protected by JwtRefreshGuard (reads token from body).
   */
  async refreshTokens(): Promise<TokenPair> {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('Nenhum refresh token disponível')
    }

    logger.debug('authService.refreshTokens: tentando renovar sessão')

    // Use a raw axios call (not the api instance) to avoid the response
    // interceptor triggering another refresh attempt on failure, creating
    // an infinite loop. axios is already statically imported at the top.
    const response = await axios.post<TokenPair>(
      `${import.meta.env.VITE_API_URL}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    )

    const { accessToken: newAccess, refreshToken: newRefresh } = response.data
    const currentUser = this.getCurrentUser()
    persistSession(newAccess, newRefresh, {
      nome: currentUser?.nome ?? null,
      email: currentUser?.email ?? null,
    })

    logger.info('Sessão renovada com sucesso via refresh token')
    return { accessToken: newAccess, refreshToken: newRefresh }
  },

  /**
   * Logout do usuário — limpa todos os tokens da sessão
   */
  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('tokenExpiration')
    logger.info('localStorage limpo — sessão encerrada')
  },

  /**
   * Verificar se usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false
    return !jwtHelper.isTokenExpired(token)
  },

  isTokenValid(): boolean {
    const token = this.getToken()
    if (!token) return false
    return !jwtHelper.isTokenExpired(token)
  },

  getTokenExpirationTime(): number | null {
    const token = this.getToken()
    if (!token) return null
    return jwtHelper.getTimeUntilExpiration(token)
  },

  getTokenExpiration(): number | null {
    const token = this.getToken()
    if (!token) return null
    return jwtHelper.getTokenExpiration(token)
  },

  shouldShowExpirationWarning(): boolean {
    const timeLeft = this.getTokenExpirationTime()
    if (!timeLeft) return false
    const fiveMinutes = 5 * 60 * 1000
    return timeLeft <= fiveMinutes && timeLeft > 0
  },

  /**
   * Obter usuário logado
   */
  getCurrentUser(): User | null {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) as User : null
    } catch (error) {
      logger.error({ error }, 'Erro ao parsear user do localStorage')
      return null
    }
  },

  /**
   * Obter access token
   */
  getToken(): string | null {
    return localStorage.getItem('token')
  },

  /**
   * Atualizar dados do usuário no localStorage
   */
  updateCurrentUser(updatedUser: User): void {
    try {
      localStorage.setItem('user', JSON.stringify(updatedUser))
      logger.info({ userId: updatedUser.id }, 'User atualizado no localStorage')
    } catch (error) {
      logger.error({ error }, 'Erro ao atualizar usuário')
    }
  },
}

export default authService
