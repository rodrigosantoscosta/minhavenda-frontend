/**
 * src/services/productService.js
 *
 * Public API for product & category data.
 *
 * Every method tries the real backend first. If the request fails for any
 * reason (network error, 5xx, backend not running locally, etc.) it
 * transparently falls back to the Faker-powered mock service and logs a
 * warning — so the app always has data, even without the backend running.
 *
 * To force mock-only mode set VITE_USE_MOCK=true in your .env.development.
 */
import api from './api'
import * as mock from '../mocks/mockProductService'
import logger from '../utils/logger'

const FORCE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * Higher-order helper: runs realFn; on any error falls back to mockFn.
 */
const withFallback = (realFn, mockFn) =>
  async (...args) => {
    if (FORCE_MOCK) return mockFn(...args)
    try {
      return await realFn(...args)
    } catch (err) {
      logger.warn(
        { url: err?.config?.url, status: err?.response?.status },
        '[mock] Backend unreachable or returned an error — falling back to mock data'
      )
      return mockFn(...args)
    }
  }

// ─── Real implementations ────────────────────────────────────────────────────

const _getProdutos = async (params = {}) => {
  const response = await api.get('/produtos', { params })
  return response.data
}

const _getProdutoById = async (id) => {
  const response = await api.get(`/produtos/${id}`)
  return response.data
}

const _getCategorias = async () => {
  const response = await api.get('/categorias')
  return response.data
}

// ─── Exported service (real + auto-fallback) ─────────────────────────────────

const productService = {
  getProdutos:    withFallback(_getProdutos,    mock.getProdutos),
  getProdutoById: withFallback(_getProdutoById, mock.getProdutoById),
  getCategorias:  withFallback(_getCategorias,  mock.getCategorias),
}

export default productService
