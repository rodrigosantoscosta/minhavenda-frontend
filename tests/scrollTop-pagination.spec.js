// @ts-check
/**
 * tests/scrollTop-pagination.spec.js
 *
 * Tests for pagination scroll behaviour on SearchPage (/busca).
 *
 * Route:    /busca?q=produto  (NOT /products — that route is commented out)
 * API:      GET /api/produtos — intercepted with mock paginated response
 *
 * Pagination component (src/components/common/Pagination.jsx) renders:
 *   - aria-label="Página anterior"   (Prev button)
 *   - aria-label="Próxima página"    (Next button)
 *   - Text: "Página X de Y"          (page indicator, capital P)
 *
 * currentPage in Pagination is 1-based (SearchPage passes pagination.page + 1).
 * handlePageChange receives 1-based page and subtracts 1 before updating URL.
 */

import { test, expect } from '@playwright/test'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fakePage(pageIndex, totalPages = 3, pageSize = 12) {
  const content = Array.from({ length: pageSize }, (_, i) => ({
    id: pageIndex * pageSize + i + 1,
    nome: `Produto ${pageIndex * pageSize + i + 1}`,
    descricao: 'Descrição de teste',
    preco: 99.9,
    urlImagem: null,
    categoriaId: 1,
    categoriaNome: 'Categoria Teste',
    ativo: true,
  }))
  return {
    content,
    totalPages,
    totalElements: totalPages * pageSize,
    number: pageIndex,
    size: pageSize,
    first: pageIndex === 0,
    last: pageIndex === totalPages - 1,
    numberOfElements: content.length,
  }
}

async function mockProducts(page, totalPages = 3) {
  await page.route('**/api/produtos**', async (route) => {
    const url = new URL(route.request().url())
    const pageParam = parseInt(url.searchParams.get('page') ?? '0', 10)
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(fakePage(pageParam, totalPages)),
    })
  })
}

async function mockCategories(page) {
  await page.route('**/api/categorias**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' })
  )
}

// ─── Suite ───────────────────────────────────────────────────────────────────

test.describe('Pagination scroll — SearchPage (/busca)', () => {

  test.beforeEach(async ({ page }) => {
    await mockProducts(page)
    await mockCategories(page)

    // Spy on window.scrollTo to assert scroll-to-top behaviour
    await page.addInitScript(() => {
      window.__scrollCalls = []
      const original = window.scrollTo.bind(window)
      window.scrollTo = (...args) => {
        const options =
          typeof args[0] === 'object'
            ? args[0]
            : { top: args[1] ?? 0, left: args[0] ?? 0 }
        window.__scrollCalls.push(options)
        try { original(...args) } catch (_) {}
      }
    })

    // SearchPage is at /busca, NOT /products
    await page.goto('/busca?q=produto')
    // Wait for at least one product card to confirm data loaded
    await expect(page.getByText('Produto 1').first()).toBeVisible()
  })

  // ── Selectors — verified from Pagination.jsx source ──────────────────────
  // prev: aria-label="Página anterior"
  // next: aria-label="Próxima página"
  // indicator: text "Página X de Y" (capital P, rendered as plain text)

  test('pagination controls are visible when there are multiple pages', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Próxima página' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Página anterior' })).toBeVisible()
    await expect(page.getByText(/Página \d+ de \d+/)).toBeVisible()
  })

  test('"Página anterior" button is disabled on the first page', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Página anterior' })).toBeDisabled()
  })

  test('"Próxima página" button is enabled on the first page', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Próxima página' })).toBeEnabled()
  })

  test('clicking "Próxima página" advances to page 2 and triggers scroll-to-top', async ({ page }) => {
    await page.evaluate(() => { window.__scrollCalls = [] })

    await page.getByRole('button', { name: 'Próxima página' }).click()

    // Pagination indicator uses 1-based display
    await expect(page.getByText('Página 2 de 3')).toBeVisible()

    // Product from page 2 must be visible (index 13 = page 1 * 12 + 1)
    await expect(page.getByText('Produto 13').first()).toBeVisible()

    const scrollCalls = await page.evaluate(() => window.__scrollCalls)
    expect(scrollCalls.some((c) => c.top === 0)).toBe(true)
  })

  test('clicking "Página anterior" goes back to page 1 and triggers scroll-to-top', async ({ page }) => {
    // Navigate to page 2 first
    await page.getByRole('button', { name: 'Próxima página' }).click()
    await expect(page.getByText('Página 2 de 3')).toBeVisible()

    await page.evaluate(() => { window.__scrollCalls = [] })

    await page.getByRole('button', { name: 'Página anterior' }).click()
    await expect(page.getByText('Página 1 de 3')).toBeVisible()

    const scrollCalls = await page.evaluate(() => window.__scrollCalls)
    expect(scrollCalls.some((c) => c.top === 0)).toBe(true)
  })

  test('"Próxima página" is disabled on the last page', async ({ page }) => {
    const nextBtn = page.getByRole('button', { name: 'Próxima página' })

    await nextBtn.click()
    await expect(page.getByText('Página 2 de 3')).toBeVisible()
    await nextBtn.click()
    await expect(page.getByText('Página 3 de 3')).toBeVisible()

    await expect(nextBtn).toBeDisabled()
  })

  test('"Página anterior" is disabled on page 1 and enabled on page 2', async ({ page }) => {
    const prevBtn = page.getByRole('button', { name: 'Página anterior' })
    const nextBtn = page.getByRole('button', { name: 'Próxima página' })

    await expect(prevBtn).toBeDisabled()

    await nextBtn.click()
    await expect(page.getByText('Página 2 de 3')).toBeVisible()

    await expect(prevBtn).toBeEnabled()
  })

  test('each page change triggers exactly one scroll-to-top call', async ({ page }) => {
    const nextBtn = page.getByRole('button', { name: 'Próxima página' })

    // Page 1 → 2
    await page.evaluate(() => { window.__scrollCalls = [] })
    await nextBtn.click()
    await expect(page.getByText('Página 2 de 3')).toBeVisible()
    let calls = await page.evaluate(() => window.__scrollCalls)
    expect(calls.filter((c) => c.top === 0)).toHaveLength(1)

    // Page 2 → 3
    await page.evaluate(() => { window.__scrollCalls = [] })
    await nextBtn.click()
    await expect(page.getByText('Página 3 de 3')).toBeVisible()
    calls = await page.evaluate(() => window.__scrollCalls)
    expect(calls.filter((c) => c.top === 0)).toHaveLength(1)
  })

  test('scroll-to-top is NOT triggered when a disabled button is force-clicked', async ({ page }) => {
    await page.evaluate(() => { window.__scrollCalls = [] })

    const prevBtn = page.getByRole('button', { name: 'Página anterior' })
    // Force-click even though disabled — handler must guard against it
    await prevBtn.click({ force: true })
    await page.waitForTimeout(300)

    const calls = await page.evaluate(() => window.__scrollCalls)
    expect(calls.filter((c) => c.top === 0)).toHaveLength(0)
  })
})
