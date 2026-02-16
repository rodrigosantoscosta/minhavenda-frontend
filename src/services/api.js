
import axios from 'axios'
import logger from '../utils/logger'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de REQUEST - Adicionar token
api.interceptors.request.use(
  (config) => {
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

// Interceptor de RESPOSTA (keep existing code...)
api.interceptors.response.use(
  (response) => {
    logger.info({
      status: response.status,
      url: response.config.url,
      method: response.config.method,
    }, 'Resposta recebida')
    return response
  },
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message
    const url = error.config?.url
    
    logger.error({
      status,
      message,
      url,
      method: error.config?.method,
    }, 'Erro na resposta da API')

    switch (status) {
      case 401:
        const isAuthEndpoint = url?.includes('/auth/login') || url?.includes('/auth/register')
        
        if (isAuthEndpoint) {
          logger.debug({ url }, '401 em endpoint de autenticacao - credenciais invalidas')
        } else {
          logger.warn({ url }, 'Token invalido ou expirado - disparando evento')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('tokenExpiration')
          window.dispatchEvent(new CustomEvent('auth:unauthorized'))
        }
        break
        
      case 403:
        logger.warn({ url }, 'Sem permissao para acessar este recurso')
        break
        
      case 404:
        logger.warn({ url }, 'Recurso nao encontrado')
        break
        
      case 500:
        logger.error('Erro interno do servidor')
        break
        
      case 503:
        logger.error('Servico temporariamente indisponivel')
        break
        
      default:
        if (!error.response) {
          logger.error('Erro de rede - Servidor inacessivel')
        }
    }
    
    return Promise.reject(error)
  }
)


/**
 * GET - Buscar dados
 */
export const get = async (url, config = {}) => {
  try {
    const response = await api.get(url, config)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * POST - Criar dados
 */
export const post = async (url, data = {}, config = {}) => {
  try {
    const response = await api.post(url, data, config)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * PUT - Atualizar dados completos
 */
export const put = async (url, data = {}, config = {}) => {
  try {
    const response = await api.put(url, data, config)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * PATCH - Atualizar dados parciais
 */
export const patch = async (url, data = {}, config = {}) => {
  try {
    const response = await api.patch(url, data, config)
    return response.data
  } catch (error) {
    throw error
  }
}

/**
 * DELETE - Deletar dados
 */
export const del = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config)
    return response.data
  } catch (error) {
    throw error
  }
}

export default api