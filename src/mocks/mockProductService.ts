/**
 * src/mocks/mockProductService.ts
 *
 * Drop-in mock for productService.ts.
 * Mirrors the exact same API contract so consumers need zero changes.
 */
import { faker } from '@faker-js/faker/locale/pt_BR'
import { getCategorias as getCategoriasFactory, getProductPool, type MockProduct } from './factories'
import type { Category } from '../types'

// Simulate realistic network latency
const delay = (ms: number = faker.number.int({ min: 120, max: 380 })): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms))

// ─── getCategorias ────────────────────────────────────────────────────────────

export const getCategorias = async (): Promise<Category[]> => {
  await delay()
  return getCategoriasFactory() as unknown as Category[]
}

// ─── getProdutos ──────────────────────────────────────────────────────────────

interface ProductFilterParams {
  page?: number
  size?: number
  sort?: string
  ativo?: boolean
  categoriaId?: string
}

interface PaginatedProducts {
  content: MockProduct[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  numberOfElements: number
}

/**
 * Supports the same params as the real backend:
 *   page, size, sort, ativo, categoriaId
 *
 * Returns the Spring Page shape: { content, totalPages, totalElements, ... }
 */
export const getProdutos = async (params: ProductFilterParams = {}): Promise<PaginatedProducts> => {
  await delay()

  const pool = getProductPool()

  // Filter
  let results = pool.filter((p) => {
    if (params.ativo !== undefined && p.ativo !== params.ativo) return false
    if (params.categoriaId && p.categoria?.id !== params.categoriaId) return false
    return true
  })

  // Sort (supports 'dataCriacao,desc' and 'preco,asc' / 'preco,desc')
  if (params.sort) {
    const [field, dir] = params.sort.split(',')
    results = [...results].sort((a, b) => {
      const va = field === 'dataCriacao' ? new Date(a[field as keyof MockProduct] as string) : a[field as keyof MockProduct]
      const vb = field === 'dataCriacao' ? new Date(b[field as keyof MockProduct] as string) : b[field as keyof MockProduct]
      if (typeof va === 'number' && typeof vb === 'number') {
        return dir === 'desc' ? vb - va : va - vb
      }
      if (va instanceof Date && vb instanceof Date) {
        return dir === 'desc' ? vb.getTime() - va.getTime() : va.getTime() - vb.getTime()
      }
      return 0
    })
  }

  // Paginate (page is 0-indexed, matching Spring)
  const page = params.page ?? 0
  const size = params.size ?? 12
  const totalElements = results.length
  const totalPages = Math.max(1, Math.ceil(totalElements / size))
  const start = page * size
  const content = results.slice(start, start + size)

  return {
    content,
    totalElements,
    totalPages,
    number: page,
    size,
    first: page === 0,
    last: page >= totalPages - 1,
    numberOfElements: content.length,
  }
}

// ─── getProdutoById ────────────────────────────────────────────────────────────

interface ProdutoDetail extends MockProduct {
  especificacoes: Array<{ chave: string; valor: string }>
}

export const getProdutoById = async (id: string | number): Promise<ProdutoDetail> => {
  await delay()

  const pool = getProductPool()
  const produto = pool.find((p) => p.id === id)

  if (!produto) {
    const err: Error & { response?: { status: number } } = new Error(`Produto ${id} não encontrado`)
    err.response = { status: 404 }
    throw err
  }

  // Return full detail shape (extra fields beyond the list card)
  return {
    ...produto,
    especificacoes: [
      { chave: 'Marca', valor: faker.company.name() },
      { chave: 'Modelo', valor: faker.commerce.productAdjective() },
      { chave: 'Garantia', valor: '12 meses' },
      { chave: 'Peso', valor: `${faker.number.float({ min: 0.1, max: 5, fractionDigits: 1 })} kg` },
      { chave: 'Dimensões', valor: `${faker.number.int({ min: 5, max: 50 })} x ${faker.number.int({ min: 5, max: 40 })} x ${faker.number.int({ min: 2, max: 30 })} cm` },
    ],
  }
}
