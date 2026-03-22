/**
 * src/mocks/mockProductService.js
 *
 * Drop-in mock for productService.js.
 * Mirrors the exact same API contract so consumers need zero changes.
 */
import { faker } from '@faker-js/faker/locale/pt_BR'
import { getCategorias as getCategoriasFactory, getProductPool } from './factories'

// Simulate realistic network latency
const delay = (ms = faker.number.int({ min: 120, max: 380 })) =>
  new Promise((resolve) => setTimeout(resolve, ms))

// ─── getCategorias ────────────────────────────────────────────────────────────

export const getCategorias = async () => {
  await delay()
  return getCategoriasFactory()
}

// ─── getProdutos ──────────────────────────────────────────────────────────────

/**
 * Supports the same params as the real backend:
 *   page, size, sort, ativo, categoriaId
 *
 * Returns the Spring Page shape: { content, totalPages, totalElements, ... }
 */
export const getProdutos = async (params = {}) => {
  await delay()

  const pool = getProductPool()

  // Filter
  let results = pool.filter((p) => {
    if (params.ativo !== undefined && p.ativo !== params.ativo) return false
    if (params.categoriaId && p.categoria.id !== params.categoriaId) return false
    return true
  })

  // Sort (supports 'dataCriacao,desc' and 'preco,asc' / 'preco,desc')
  if (params.sort) {
    const [field, dir] = params.sort.split(',')
    results = [...results].sort((a, b) => {
      const va = field === 'dataCriacao' ? new Date(a[field]) : a[field]
      const vb = field === 'dataCriacao' ? new Date(b[field]) : b[field]
      return dir === 'desc' ? vb - va : va - vb
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

export const getProdutoById = async (id) => {
  await delay()

  const pool = getProductPool()
  const produto = pool.find((p) => p.id === id)

  if (!produto) {
    const err = new Error(`Produto ${id} não encontrado`)
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
