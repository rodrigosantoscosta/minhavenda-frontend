// @ts-check
/**
 * tests/login.spec.js — Login page E2E tests
 *
 * All API calls are intercepted with page.route() — no real backend needed.
 * Mock shape matches AuthResponseDto: { accessToken, refreshToken, email, nome }
 */
import { test, expect } from '@playwright/test'

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Fake JWT — minimal valid structure so jwtHelper.decodeToken() can extract
 * the payload without throwing. Payload: { sub, email, role, exp }.
 */
const FAKE_JWT =
  'eyJhbGciOiJIUzI1NiJ9.' +
  btoa(JSON.stringify({ sub: 'uuid-1', email: 'joao@email.com', role: 'CLIENTE', exp: Math.floor(Date.now() / 1000) + 86400 }))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_') +
  '.fakesig'

function mockLoginSuccess(page) {
  return page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: FAKE_JWT,
        refreshToken: 'fake-refresh-token',
        email: 'joao@email.com',
        nome: 'João Silva',
      }),
    })
  )
}

function mockLoginFailure(page) {
  return page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Credenciais inválidas' }),
    })
  )
}

// ─── Suite ───────────────────────────────────────────────────────────────────

test.describe('Login page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    // Actual heading rendered by Login.jsx is "Acesse sua conta" (h2)
    await expect(page.getByRole('heading', { name: /acesse sua conta/i })).toBeVisible()
  })

  // ── 1. Page renders correctly ─────────────────────────────────────────────

  test('shows email and password fields and a submit button', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/senha/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /^entrar$/i })).toBeVisible()
  })

  test('shows the Google login button', async ({ page }) => {
    await expect(page.getByRole('link', { name: /entrar com google/i })).toBeVisible()
  })

  // ── 2. Client-side validation ─────────────────────────────────────────────

  test('shows validation errors when submitting an empty form', async ({ page }) => {
    await page.getByRole('button', { name: /^entrar$/i }).click()
    await expect(page.getByText(/email é obrigatório/i)).toBeVisible()
    await expect(page.getByText(/senha é obrigatória/i)).toBeVisible()
  })

  test('shows "email inválido" for a malformed email', async ({ page }) => {
    await page.getByLabel(/email/i).fill('not-an-email')
    await page.getByRole('button', { name: /^entrar$/i }).click()
    await expect(page.getByText(/email inválido/i)).toBeVisible()
  })

  // ── 3. Successful login ───────────────────────────────────────────────────

  test('redirects to home page after successful login', async ({ page }) => {
    await mockLoginSuccess(page)
    await page.getByLabel(/email/i).fill('joao@email.com')
    await page.getByLabel(/senha/i).fill('senha123')
    await page.getByRole('button', { name: /^entrar$/i }).click()
    await expect(page).toHaveURL('/')
  })

  test('shows the user first name in the header after login', async ({ page }) => {
    await mockLoginSuccess(page)
    await page.getByLabel(/email/i).fill('joao@email.com')
    await page.getByLabel(/senha/i).fill('senha123')
    await page.getByRole('button', { name: /^entrar$/i }).click()
    // Header shows first name extracted from the user object
    await expect(page.getByText('João')).toBeVisible()
  })

  // ── 4. Failed login ───────────────────────────────────────────────────────

  test('shows a server error message on wrong credentials', async ({ page }) => {
    await mockLoginFailure(page)
    await page.getByLabel(/email/i).fill('joao@email.com')
    await page.getByLabel(/senha/i).fill('senhaerrada')
    await page.getByRole('button', { name: /^entrar$/i }).click()
    await expect(page.getByText(/credenciais inválidas/i)).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  // ── 5. Toggle password visibility ────────────────────────────────────────

  test('toggles password field type when the eye icon is clicked', async ({ page }) => {
    const passwordInput = page.getByLabel(/senha/i)
    await passwordInput.fill('minhaSenha')
    await expect(passwordInput).toHaveAttribute('type', 'password')
    await page.getByRole('button', { name: /mostrar senha/i }).click()
    await expect(passwordInput).toHaveAttribute('type', 'text')
  })

  // ── 6. Navigation ─────────────────────────────────────────────────────────

  test('has a working link to the register page', async ({ page }) => {
    // Link text rendered by Login.jsx: "Cadastre-se grátis"
    await page.getByRole('link', { name: /cadastre-se/i }).click()
    await expect(page).toHaveURL('/register')
  })
})
