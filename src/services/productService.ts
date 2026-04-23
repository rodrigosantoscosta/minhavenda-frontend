/**
 * src/services/productService.ts
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
import type { Product, Category, ProductFilter } from '../types'

const FORCE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/**
 * Higher-order helper: runs realFn; on any error falls back to mockFn.
 */
const withFallback = <T extends (...args: Parameters<T>) => ReturnType<T>>(realFn: T, mockFn: T): T =>
  (async (...args: Parameters<T>) => {
    if (FORCE_MOCK) return mockFn(...args)
    try {
      return await realFn(...args)
    } catch (err) {
      logger.warn(
        { url: (err as { config?: { url?: string } })?.config?.url, status: (err as { response?: { status?: number } })?.response?.status },
        '[mock] Backend unreachable or returned an error — falling back to mock data'
      )
      return mockFn(...args)
    }
  }) as T

// ─── Real implementations ────────────────────────────────────────────────────

const _getProdutos = async (params: ProductFilter = {}): Promise<Product[]> => {
  const response = await api.get<Product[]>('/produtos', { params })
  return response.data
}

const _getProdutoById = async (id: string | number): Promise<Product> => {
  const response = await api.get<Product>(`/produtos/${id}`)
  return response.data
}

const _getCategorias = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/categorias')
  return response.data
}

// ─── Exported service (real + auto-fallback) ─────────────────────────────────

interface ProductService {
  getProdutos(params?: ProductFilter): Promise<Product[]>
  getProdutoById(id: string | number): Promise<Product>
  getCategorias(): Promise<Category[]>
}

const productService: ProductService = {
  getProdutos:    withFallback(_getProdutos,    mock.getProdutos as typeof _getProdutos),
  getProdutoById: withFallback(_getProdutoById, mock.getProdutoById as typeof _getProdutoById),
  getCategorias:  withFallback(_getCategorias,  mock.getCategorias as typeof _getCategorias),
}

export default productService
