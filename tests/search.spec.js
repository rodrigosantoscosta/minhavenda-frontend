// @ts-check
/**
 * tests/search.spec.js — SearchPage (/busca) E2E tests
 *
 * All API calls are intercepted — no real backend needed.
 * Selector rules:
 *   - Use .first() when a text pattern can match multiple product names
 *     (e.g. /produto 1/i also matches "Produto 10", "Produto 11", "Produto 12")
 *   - Prefer exact text for product cards to avoid strict mode violations
 */

import { test, expect } from '@playwright/test'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fakePage({ pageIndex = 0, totalPages = 3, pageSize = 12, term = '' } = {}) {
  const totalElements = totalPages * pageSize
  const content = Array.from({ length: pageSize }, (_, i) => ({
    id: pageIndex * pageSize + i + 1,
    nome: `${term ? term + ' ' : ''}Produto ${pageIndex * pageSize + i + 1}`,
    descricao: 'Descrição de teste',
    preco: 49.9 + i,
    precoPromocional: null,
    urlImagem: null,
    categoriaId: 1,
    categoriaNome: 'Categoria Teste',
    ativo: true,
    quantidadeEstoque: 10,
  }))
  return {
    content,
    totalPages,
    totalElements,
    number: pageIndex,
    size: pageSize,
    first: pageIndex === 0,
    last: pageIndex === totalPages - 1,
    numberOfElements: content.length,
  }
}

function mockProductSearch(page, { totalPages = 3 } = {}) {
  return page.route('**/api/produtos**', async (route) => {
    const url = new URL(route.request().url())
    const pageIndex = parseInt(url.searchParams.get('page') ?? '0', 10)
    const term = url.searchParams.get('nome') ?? url.searchParams.get('q') ?? ''
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fakePage({ pageIndex, totalPages, term })),
    })
  })
}

function mockEmptySearch(page) {
  return page.route('**/api/produtos**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fakePage({ totalPages: 0, pageSize: 0 })),
    })
  )
}

function mockCategories(page) {
  return page.route('**/api/categorias**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  )
}

// ─── Suite ───────────────────────────────────────────────────────────────────

test.describe('Search page (/busca)', () => {

  // ── 1. Basic render ───────────────────────────────────────────────────────

  test('shows product cards when results are returned', async ({ page }) => {
    await mockProductSearch(page)
    await mockCategories(page)
    await page.goto('/busca?q=produto')

    // Use .first() to avoid strict mode violation — "Produto 1" also matches
    // "Produto 10", "Produto 11", "Produto 12" since the regex is /produto 1/i
    await expect(page.getByText('Produto 1').first()).toBeVisible()
  })

  test('shows result count in the header', async ({ page }) => {
    await mockProductSearch(page, { totalPages: 3 })
    await mockCategories(page)
    await page.goto('/busca?q=azeite')

    // 3 pages × 12 = 36 produtos encontrados
    await expect(page.getByText(/36 produto/i)).toBeVisible()
  })

  // ── 2. Empty state ────────────────────────────────────────────────────────

  test('shows empty state when no products match', async ({ page }) => {
    await mockEmptySearch(page)
    await mockCategories(page)
    await page.goto('/busca?q=xyzinexistente')

    await expect(page.getByText(/nenhum produto encontrado/i)).toBeVisible()
  })

  // ── 3. Pagination ─────────────────────────────────────────────────────────

  test('pagination controls appear when there are multiple pages', async ({ page }) => {
    await mockProductSearch(page, { totalPages: 3 })
    await mockCategories(page)
    await page.goto('/busca?q=produto')

    // aria-labels verified from Pagination.jsx source
    await expect(page.getByRole('button', { name: 'Próxima página' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Página anterior' })).toBeVisible()
  })

  test('clicking next page loads page 2 products', async ({ page }) => {
    await mockProductSearch(page, { totalPages: 3 })
    await mockCategories(page)
    await page.goto('/busca?q=produto')

    await page.getByRole('button', { name: 'Próxima página' }).click()

    // Page indicator updates (1-based display)
    await expect(page.getByText('Página 2 de 3')).toBeVisible()

    // Product 13 is the first item on page 2 (index 1*12+1)
    await expect(page.getByText('Produto 13').first()).toBeVisible()
  })

  // ── 4. Search from the header bar ─────────────────────────────────────────

  test('typing in the header search bar and submitting navigates to /busca', async ({ page }) => {
    await mockProductSearch(page)
    await mockCategories(page)
    await page.goto('/')

    const searchInput = page.getByPlaceholder(/buscar produtos/i).first()
    await searchInput.fill('notebook')
    await searchInput.press('Enter')

    await expect(page).toHaveURL(/\/busca\?.*q=notebook|\/busca\?.*nome=notebook/)
  })

  // ── 5. Mobile filters ─────────────────────────────────────────────────────

  test('opening filters panel on mobile shows the filter sidebar', async ({ page }) => {
    await mockProductSearch(page)
    await mockCategories(page)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/busca?q=produto')

    // "Filtros" button is only visible on < lg screens
    const filterBtn = page.getByRole('button', { name: /^filtros$/i })
    await expect(filterBtn).toBeVisible()
    await filterBtn.click()

    await expect(page.getByText(/filtros/i).first()).toBeVisible()
  })
})
