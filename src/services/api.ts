import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import logger from '../utils/logger'

// authService is imported here for the silent-refresh interceptor.
// The circular reference (authService → api → authService) is intentional
// and safe in ESM: by the time the interceptor fires at runtime, both modules
// are fully initialised. The dynamic import() approach was not needed.
import authService from './authService'

const API_URL = import.meta.env.VITE_API_URL

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── REQUEST interceptor — attach access token ─────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')

    if (token && token !== 'null' && token !== 'undefined') {
      config.headers.Authorization = `Bearer ${token}`
      logger.debug({ url: config.url, method: config.method }, 'Request with token')
    } else {
      logger.debug({ url: config.url, method: config.method }, 'Request without token')
    }

    return config
  },
  (error) => {
    logger.error({ error }, 'Request interceptor error')
    return Promise.reject(error)
  }
)

// ── RESPONSE interceptor — handle errors + silent token refresh ───────────────
//
// Refresh token flow:
//   1. A 401 arrives on a non-auth, non-refresh endpoint.
//   2. We attempt a silent refresh via authService.refreshTokens().
//   3. If it succeeds, we retry the original request once with the new token.
//   4. If it fails (refresh token also invalid/expired), we clear state and
//      fire the auth:unauthorized event so AuthContext can force a logout.
//
// _retried flag: prevents infinite retry loops — a request that already went
// through the refresh cycle will not be retried again if it 401s a second time.

let isRefreshing = false
let refreshQueue: Array<{ resolve: (token: string | null) => void; reject: (error: unknown) => void }> = []   // Queued requests waiting for the in-flight refresh

function processQueue(error: unknown | null, token: string | null = null) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  refreshQueue = []
}

api.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.info({
      status: response.status,
      url: response.config.url,
      method: response.config.method,
    }, 'Resposta recebida')
    return response
  },
  async (error) => {
    const status  = error.response?.status
    const url     = error.config?.url
    const message = error.response?.data?.message || error.message

    logger.error({ status, message, url, method: error.config?.method }, 'Erro na resposta da API')

    const isAuthEndpoint    = url?.includes('/auth/login') || url?.includes('/auth/register')
    const isRefreshEndpoint = url?.includes('/auth/refresh')
    const isOAuthEndpoint   = url?.includes('/auth/google')

    if (status === 401) {
      if (isAuthEndpoint || isRefreshEndpoint || isOAuthEndpoint) {
        // Credential errors on auth routes — let the caller handle them
        logger.debug({ url }, '401 em endpoint de autenticação — não tenta refresh')
        return Promise.reject(error)
      }

      if (error.config._retried) {
        // Already retried once after a refresh — give up
        logger.warn({ url }, '401 após retry — encerrando sessão')
        clearSessionAndNotify()
        return Promise.reject(error)
      }

      // ── Silent refresh ──────────────────────────────────────────────────────
      if (isRefreshing) {
        // Another request is already refreshing — queue this one
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject })
        }).then((token) => {
          error.config.headers.Authorization = `Bearer ${token}`
          return api(error.config)
        })
      }

      isRefreshing = true
      error.config._retried = true

      try {
        const { accessToken } = await authService.refreshTokens()

        logger.info({ url }, 'Token renovado — repetindo requisição original')
        processQueue(null, accessToken)

        error.config.headers.Authorization = `Bearer ${accessToken}`
        return api(error.config)
      } catch (refreshError) {
        logger.warn('Falha ao renovar token — encerrando sessão')
        processQueue(refreshError)
        clearSessionAndNotify()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    switch (status) {
      case 403:
        logger.warn({ url }, 'Sem permissão para acessar este recurso')
        break
      case 404:
        logger.warn({ url }, 'Recurso não encontrado')
        break
      case 500:
        logger.error('Erro interno do servidor')
        break
      case 503:
        logger.error('Serviço temporariamente indisponível')
        break
      default:
        if (!error.response) {
          logger.error('Erro de rede — Servidor inacessível')
        }
    }

    return Promise.reject(error)
  }
)

function clearSessionAndNotify() {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  localStorage.removeItem('tokenExpiration')
  window.dispatchEvent(new CustomEvent('auth:unauthorized'))
}

// ── Helper methods ────────────────────────────────────────────────────────────

export const get = async <T = unknown>(url: string, config: AxiosRequestConfig = {}): Promise<T> => {
  const response = await api.get<T>(url, config)
  return response.data
}

export const post = async <T = unknown>(url: string, data: unknown = {}, config: AxiosRequestConfig = {}): Promise<T> => {
  const response = await api.post<T>(url, data, config)
  return response.data
}

export const put = async <T = unknown>(url: string, data: unknown = {}, config: AxiosRequestConfig = {}): Promise<T> => {
  const response = await api.put<T>(url, data, config)
  return response.data
}

export const patch = async <T = unknown>(url: string, data: unknown = {}, config: AxiosRequestConfig = {}): Promise<T> => {
  const response = await api.patch<T>(url, data, config)
  return response.data
}

export const del = async <T = unknown>(url: string, config: AxiosRequestConfig = {}): Promise<T> => {
  const response = await api.delete<T>(url, config)
  return response.data
}

export default api
