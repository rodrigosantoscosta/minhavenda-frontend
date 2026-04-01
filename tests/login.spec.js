// @ts-check
/**
 * tests/login.spec.js — Login page E2E tests
 *
 * Mock shape matches current AuthResponseDto:
 *   { accessToken, refreshToken, email, nome }
 *
 * Selectors verified against actual Login.jsx render:
 *   - Heading h2:      "Acesse sua conta"
 *   - Register link:   "Cadastre-se grátis"
 *   - Submit button:   "Entrar"
 *   - Password toggle: aria-label "Mostrar senha" / "Ocultar senha"
 *   - Google button:   link "Entrar com Google"
 */

import { test, expect } from '@playwright/test'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Minimal valid JWT with a far-future exp so jwtHelper.isTokenExpired()
 * returns false and AuthContext treats the login as successful.
 * Payload: { sub, email, role: "CLIENTE", exp: year 2286 }
 */
function makeFakeJwt(overrides = {}) {
  const payload = {
    sub: 'uid-test-1',
    email: 'joao@email.com',
    role: 'CLIENTE',
    exp: 9999999999,
    ...overrides,
  }
  const b64 = (obj) =>
    btoa(JSON.stringify(obj))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  return `${b64({ alg: 'HS256' })}.${b64(payload)}.fakesig`
}

/** Mock a successful login response — AuthResponseDto shape */
function mockLoginSuccess(page, overrides = {}) {
  return page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        accessToken: makeFakeJwt(),
        refreshToken: 'fake-refresh-token',
        email: 'joao@email.com',
        nome: 'João Silva',
        ...overrides,
      }),
    })
  )
}

/** Mock a failed login — 401 with mensagem field (Portuguese error path) */
function mockLoginFailure(page) {
  return page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ mensagem: 'Credenciais inválidas' }),
    })
  )
}

// ─── Suite ───────────────────────────────────────────────────────────────────

test.describe('Login page', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    // Actual h2 text in Login.jsx is "Acesse sua conta"
    await expect(page.getByRole('heading', { name: /acesse sua conta/i })).toBeVisible()
  })

  // ── 1. Page renders correctly ─────────────────────────────────────────────

  test('shows email and password fields and a submit button', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/senha/i)).toBeVisible()
    // Exact match avoids grabbing the "Mostrar senha" toggle button
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

  test('shows the user name in the header after login', async ({ page }) => {
    await mockLoginSuccess(page)
    await page.getByLabel(/email/i).fill('joao@email.com')
    await page.getByLabel(/senha/i).fill('senha123')
    await page.getByRole('button', { name: /^entrar$/i }).click()
    // Header displays first name extracted from JWT payload by buildUser()
    await expect(page.getByText('João')).toBeVisible()
  })

  // ── 4. Failed login ───────────────────────────────────────────────────────

  test('shows a server error message on wrong credentials', async ({ page }) => {
    await mockLoginFailure(page)
    await page.getByLabel(/email/i).fill('joao@email.com')
    await page.getByLabel(/senha/i).fill('senhaerrada')
    await page.getByRole('button', { name: /^entrar$/i }).click()
    // authService maps mensagem field to the error banner
    await expect(page.getByText(/credenciais inválidas/i)).toBeVisible()
    // Must stay on login — no redirect on failure
    await expect(page).toHaveURL('/login')
  })

  // ── 5. Toggle password visibility ─────────────────────────────────────────

  test('toggles password field type when the eye icon is clicked', async ({ page }) => {
    const passwordInput = page.getByLabel(/senha/i)
    await passwordInput.fill('minhaSenha')

    // Initially hidden
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // aria-label verified from Login.jsx: "Mostrar senha"
    await page.getByRole('button', { name: /mostrar senha/i }).click()

    await expect(passwordInput).toHaveAttribute('type', 'text')
  })

  // ── 6. Navigation ─────────────────────────────────────────────────────────

  test('has a working link to the register page', async ({ page }) => {
    // Link text in Login.jsx: "Cadastre-se grátis"
    await page.getByRole('link', { name: /cadastre-se/i }).click()
    await expect(page).toHaveURL('/register')
  })
})
