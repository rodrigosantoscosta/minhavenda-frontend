// @ts-check
/**
 * tests/search.spec.js
 *
 * Example E2E test suite for the Search page (/busca).
 *
 * ─── WHAT THIS FILE TEACHES ────────────────────────────────────────────────
 *
 * 1. HOW TO MOCK A PAGINATED API
 *    The search page hits /api/produtos with query params. We intercept the
 *    request, inspect the params, and return matching mock data. This lets us
 *    test pagination, empty states, and filter behaviour without a real DB.
 *
 * 2. HOW TO TEST URL-DRIVEN STATE
 *    The search page stores filters and pagination in the URL query string.
 *    We assert on page.url() to verify state is correctly serialised.
 *
 * 3. HOW TO TEST EMPTY STATES
 *    Return an empty content array from the mock and assert the "no results"
 *    UI is shown.
 *
 * ───────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Build a fake Spring-style paginated response */
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

/** Intercept /api/produtos and return paginated mock data */
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

/** Return an empty result set */
function mockEmptySearch(page) {
  return page.route('**/api/produtos**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fakePage({ totalPages: 0, pageSize: 0 })),
    })
  )
}

// ─── Test suite ─────────────────────────────────────────────────────────────

test.describe('Search page (/busca)', () => {

  // ── 1. Basic render ────────────────────────────────────────────────────────

  test('shows product cards when results are returned', async ({ page }) => {
    await mockProductSearch(page)
    await page.goto('/busca?q=produto')

    // At least one product card must be visible
    await expect(page.getByText(/produto 1/i)).toBeVisible()
  })

  test('shows result count in the header', async ({ page }) => {
    await mockProductSearch(page, { totalPages: 3 })
    await page.goto('/busca?q=azeite')

    // 3 pages × 12 items = 36 produtos encontrados
    await expect(page.getByText(/36 produto/i)).toBeVisible()
  })

  // ── 2. Empty state ─────────────────────────────────────────────────────────

  test('shows empty state when no products match', async ({ page }) => {
    await mockEmptySearch(page)
    await page.goto('/busca?q=xyzinexistente')

    await expect(page.getByText(/nenhum produto encontrado/i)).toBeVisible()
  })

  // ── 3. Pagination ──────────────────────────────────────────────────────────

  test('pagination controls appear when there are multiple pages', async ({ page }) => {
    await mockProductSearch(page, { totalPages: 3 })
    await page.goto('/busca?q=produto')

    // Pagination is rendered by the Pagination component
    await expect(page.getByRole('button', { name: /próxima/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /anterior/i })).toBeVisible()
  })

  test('clicking next page loads page 2 and updates the URL', async ({ page }) => {
    await mockProductSearch(page, { totalPages: 3 })
    await page.goto('/busca?q=produto')

    await page.getByRole('button', { name: /próxima/i }).click()

    // URL must reflect page=1 (0-based internally, but URL param matches backend)
    await expect(page).toHaveURL(/page=1/)

    // A product from page 2 should now be visible
    await expect(page.getByText(/produto 13/i)).toBeVisible()
  })

  // ── 4. Search from the header bar ─────────────────────────────────────────

  test('typing in the header search bar and submitting navigates to /busca', async ({ page }) => {
    await mockProductSearch(page)

    // Start from home so the header SearchBar is visible
    await page.goto('/')

    const searchInput = page.getByPlaceholder(/buscar produtos/i).first()
    await searchInput.fill('notebook')
    await searchInput.press('Enter')

    // Should redirect to /busca with q param
    await expect(page).toHaveURL(/\/busca\?q=notebook/)
  })

  // ── 5. Filters ─────────────────────────────────────────────────────────────

  test('opening filters panel on mobile shows the filter sidebar', async ({ page }) => {
    await mockProductSearch(page)

    // Use a mobile viewport
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/busca?q=produto')

    // The filter toggle button is only visible on < lg screens
    const filterBtn = page.getByRole('button', { name: /filtros/i })
    await expect(filterBtn).toBeVisible()
    await filterBtn.click()

    // After clicking, the filter panel heading should be visible
    await expect(page.getByText(/filtros/i).first()).toBeVisible()
  })
})
