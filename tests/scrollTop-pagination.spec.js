// @ts-check
import { test, expect } from '@playwright/test'

/**
 * scrollTop-pagination.spec.js
 *
 * Tests for the useScrollOnPageChange hook behavior on ProductPage.
 *
 * What we're testing:
 *   - When the user clicks "Próxima →" (next page), the page scrolls back to the top.
 *   - When the user clicks "← Anterior" (previous page), the page scrolls back to the top.
 *   - The "Anterior" button is disabled on page 1.
 *   - The "Próxima" button is disabled on the last page.
 *   - The page indicator text updates correctly on navigation.
 *
 * Strategy:
 *   The dev server must be running on http://localhost:5173 (Vite default).
 *   The backend API does NOT need to be real — we intercept /api/produtos with
 *   a mock that returns a paginated response with enough data (3 pages of 12)
 *   so all pagination UI is rendered.
 *
 *   scrollTo is mocked at the page level so we can assert it was called with
 *   { top: 0, behavior: 'smooth' } without needing an actual tall page.
 */

const BASE_URL = 'http://localhost:5173'
const PRODUCTS_URL = `${BASE_URL}/products`

/** Build a fake paginated API response */
function fakePage(page, totalPages = 3, pageSize = 12) {
  const totalElements = totalPages * pageSize
  const content = Array.from({ length: pageSize }, (_, i) => ({
    id: page * pageSize + i + 1,
    nome: `Produto ${page * pageSize + i + 1}`,
    descricao: 'Descrição de teste',
    preco: 99.9,
    moeda: 'BRL',
    urlImagem: null,
    categoriaId: 1,
    categoriaNome: 'Categoria Teste',
    ativo: true,
    dataCadastro: new Date().toISOString(),
  }))
  return {
    content,
    totalPages,
    totalElements,
    number: page,        // 0-based
    size: pageSize,
    first: page === 0,
    last: page === totalPages - 1,
    numberOfElements: content.length,
  }
}

test.describe('useScrollOnPageChange — ProductPage pagination scroll', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept ALL /api/produtos requests and respond with paged mock data.
    // Playwright intercepts are matched per-request so we can inspect query params.
    await page.route('**/api/produtos**', async (route) => {
      const url = new URL(route.request().url())
      const pageParam = parseInt(url.searchParams.get('page') ?? '0', 10)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakePage(pageParam, 3, 12)),
      })
    })

    // Mock window.scrollTo so we can spy on calls without needing a real
    // tall document. Returns a list of recorded calls via window.__scrollCalls.
    await page.addInitScript(() => {
      window.__scrollCalls = []
      const original = window.scrollTo.bind(window)
      window.scrollTo = (...args) => {
        // scrollTo can be called as scrollTo(x, y) or scrollTo(options)
        const options = typeof args[0] === 'object' ? args[0] : { top: args[1] ?? 0, left: args[0] ?? 0 }
        window.__scrollCalls.push(options)
        // Still call the original so scroll position is updated for selectors
        try { original(...args) } catch (_) {}
      }
    })

    await page.goto(PRODUCTS_URL)
    // Wait for products to render (at least one product card visible)
    await page.waitForSelector('[data-testid="product-card"], .product-card, h1', { timeout: 10_000 })
  })

  test('pagination controls are visible when there are multiple pages', async ({ page }) => {
    const nextBtn = page.getByRole('button', { name: /próxima/i })
    const prevBtn = page.getByRole('button', { name: /anterior/i })
    const pageIndicator = page.getByText(/página \d+ de \d+/i)

    await expect(nextBtn).toBeVisible()
    await expect(prevBtn).toBeVisible()
    await expect(pageIndicator).toBeVisible()
  })

  test('"Anterior" button is disabled on first page', async ({ page }) => {
    const prevBtn = page.getByRole('button', { name: /anterior/i })
    await expect(prevBtn).toBeDisabled()
  })

  test('"Próxima" button is enabled on first page', async ({ page }) => {
    const nextBtn = page.getByRole('button', { name: /próxima/i })
    await expect(nextBtn).toBeEnabled()
  })

  test('clicking "Próxima" advances to page 2 and triggers scrollTo top', async ({ page }) => {
    // Clear any scroll calls from initial render
    await page.evaluate(() => { window.__scrollCalls = [] })

    const nextBtn = page.getByRole('button', { name: /próxima/i })
    await nextBtn.click()

    // Wait for page indicator to update
    await expect(page.getByText(/página 2 de 3/i)).toBeVisible()

    // Assert scrollTo was called with top: 0
    const scrollCalls = await page.evaluate(() => window.__scrollCalls)
    expect(scrollCalls.length).toBeGreaterThanOrEqual(1)
    const lastCall = scrollCalls[scrollCalls.length - 1]
    expect(lastCall.top).toBe(0)
    expect(lastCall.behavior).toBe('smooth')
  })

  test('clicking "Anterior" goes back to page 1 and triggers scrollTo top', async ({ page }) => {
    // Navigate to page 2 first
    const nextBtn = page.getByRole('button', { name: /próxima/i })
    await nextBtn.click()
    await expect(page.getByText(/página 2 de 3/i)).toBeVisible()

    // Clear recorded scroll calls
    await page.evaluate(() => { window.__scrollCalls = [] })

    const prevBtn = page.getByRole('button', { name: /anterior/i })
    await prevBtn.click()

    await expect(page.getByText(/página 1 de 3/i)).toBeVisible()

    const scrollCalls = await page.evaluate(() => window.__scrollCalls)
    expect(scrollCalls.length).toBeGreaterThanOrEqual(1)
    const lastCall = scrollCalls[scrollCalls.length - 1]
    expect(lastCall.top).toBe(0)
    expect(lastCall.behavior).toBe('smooth')
  })

  test('"Próxima" is disabled on the last page', async ({ page }) => {
    const nextBtn = page.getByRole('button', { name: /próxima/i })

    // Navigate to last page (page 3 of 3 — two clicks from page 1)
    await nextBtn.click()
    await expect(page.getByText(/página 2 de 3/i)).toBeVisible()
    await nextBtn.click()
    await expect(page.getByText(/página 3 de 3/i)).toBeVisible()

    await expect(nextBtn).toBeDisabled()
  })

  test('"Anterior" is enabled on page 2 and disabled on page 1', async ({ page }) => {
    const nextBtn = page.getByRole('button', { name: /próxima/i })
    const prevBtn = page.getByRole('button', { name: /anterior/i })

    // On page 1 — Anterior should be disabled
    await expect(prevBtn).toBeDisabled()

    // Navigate to page 2
    await nextBtn.click()
    await expect(page.getByText(/página 2 de 3/i)).toBeVisible()

    // On page 2 — Anterior should now be enabled
    await expect(prevBtn).toBeEnabled()
  })

  test('each page navigation triggers exactly one scrollTo(top:0) call', async ({ page }) => {
    const nextBtn = page.getByRole('button', { name: /próxima/i })

    // Page 1→2
    await page.evaluate(() => { window.__scrollCalls = [] })
    await nextBtn.click()
    await expect(page.getByText(/página 2 de 3/i)).toBeVisible()
    let calls = await page.evaluate(() => window.__scrollCalls)
    const topCalls = calls.filter(c => c.top === 0)
    expect(topCalls).toHaveLength(1)

    // Page 2→3
    await page.evaluate(() => { window.__scrollCalls = [] })
    await nextBtn.click()
    await expect(page.getByText(/página 3 de 3/i)).toBeVisible()
    calls = await page.evaluate(() => window.__scrollCalls)
    const topCalls2 = calls.filter(c => c.top === 0)
    expect(topCalls2).toHaveLength(1)
  })

  test('scrollTo is NOT called when a disabled button is clicked', async ({ page }) => {
    // "Anterior" is disabled on page 1 — clicking it should not fire scrollTo
    await page.evaluate(() => { window.__scrollCalls = [] })

    const prevBtn = page.getByRole('button', { name: /anterior/i })
    // Force-click even though it's disabled (to verify the handler is guarded)
    await prevBtn.click({ force: true })

    // Small wait to let any async effects settle
    await page.waitForTimeout(300)

    const calls = await page.evaluate(() => window.__scrollCalls)
    const topCalls = calls.filter(c => c.top === 0)
    // No new scroll-to-top should have been triggered
    expect(topCalls).toHaveLength(0)
  })
})
