// @ts-check
/**
 * tests/login.spec.js
 *
 * Example E2E test suite for the Login page.
 *
 * ─── WHAT THIS FILE TEACHES ────────────────────────────────────────────────
 *
 * 1. HOW TO MOCK THE BACKEND
 *    E2E tests must never hit a real API. We intercept every /api/auth/login
 *    request with page.route() and return the exact JSON shape the frontend
 *    expects. This makes tests fast, deterministic, and runnable with no
 *    backend running.
 *
 * 2. WHAT TO TEST AT THE E2E LAYER
 *    ✅ User-visible behaviour: does the error message appear? Does the page
 *       redirect after login? Does the cart icon show?
 *    ❌ NOT unit logic: don't test "does validateEmail() return false for
 *       'foo'". That belongs in a unit test, not here.
 *
 * 3. SELECTOR PRIORITY (best → worst)
 *    getByRole()   → getByLabel() → getByText() → getByPlaceholder()
 *    → getByTestId()  (last resort — requires adding data-testid to source)
 *
 * 4. NEVER use page.waitForTimeout() — always wait for a visible element or
 *    a URL change instead.
 *
 * 5. WORKFLOW
 *    Write test → run `pnpm test:e2e:ui` to watch it → fix → commit.
 *    Do not run `pnpm dev` first — webServer in playwright.config.js starts
 *    Vite automatically.
 *
 * ───────────────────────────────────────────────────────────────────────────
 */

import { test, expect } from '@playwright/test'

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Mock a successful login response.
 * Shape must match exactly what AuthContext / authService.js expects.
 */
function mockLoginSuccess(page) {
  return page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'fake-jwt-token',
        email: 'joao@email.com',
        nome: 'João Silva',
        tipo: 'CLIENTE',
      }),
    })
  )
}

/**
 * Mock a failed login response (wrong credentials).
 */
function mockLoginFailure(page) {
  return page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Credenciais inválidas' }),
    })
  )
}

// ─── Test suite ─────────────────────────────────────────────────────────────

test.describe('Login page', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the login page before each test.
    // baseURL is set to http://localhost:5173 in playwright.config.js
    // so we only need the path here.
    await page.goto('/login')

    // Wait until the login form is visible before each test runs.
    await expect(page.getByRole('heading', { name: /faça login/i })).toBeVisible()
  })

  // ── 1. Page renders correctly ──────────────────────────────────────────────

  test('shows email and password fields and a submit button', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/senha/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()
  })

  // ── 2. Client-side validation ──────────────────────────────────────────────

  test('shows validation errors when submitting an empty form', async ({ page }) => {
    await page.getByRole('button', { name: /entrar/i }).click()

    // The frontend validates locally before calling the API
    await expect(page.getByText(/email é obrigatório/i)).toBeVisible()
    await expect(page.getByText(/senha é obrigatória/i)).toBeVisible()
  })

  test('shows "email inválido" for a malformed email', async ({ page }) => {
    await page.getByLabel(/email/i).fill('not-an-email')
    await page.getByRole('button', { name: /entrar/i }).click()

    await expect(page.getByText(/email inválido/i)).toBeVisible()
  })

  // ── 3. Successful login ────────────────────────────────────────────────────

  test('redirects to home page after successful login', async ({ page }) => {
    await mockLoginSuccess(page)

    await page.getByLabel(/email/i).fill('joao@email.com')
    await page.getByLabel(/senha/i).fill('senha123')
    await page.getByRole('button', { name: /entrar/i }).click()

    // After login the app redirects to '/'
    await expect(page).toHaveURL('/')
  })

  test('shows the user name in the header after login', async ({ page }) => {
    await mockLoginSuccess(page)

    await page.getByLabel(/email/i).fill('joao@email.com')
    await page.getByLabel(/senha/i).fill('senha123')
    await page.getByRole('button', { name: /entrar/i }).click()

    // The header shows the first name from the token response
    await expect(page.getByText('João')).toBeVisible()
  })

  // ── 4. Failed login ────────────────────────────────────────────────────────

  test('shows a server error message on wrong credentials', async ({ page }) => {
    await mockLoginFailure(page)

    await page.getByLabel(/email/i).fill('joao@email.com')
    await page.getByLabel(/senha/i).fill('senhaerrada')
    await page.getByRole('button', { name: /entrar/i }).click()

    // The error banner should appear — do NOT assert the exact string,
    // only that something went wrong (backend message may change).
    await expect(page.getByText(/credenciais inválidas/i)).toBeVisible()

    // The URL must NOT have changed — user stays on /login
    await expect(page).toHaveURL('/login')
  })

  // ── 5. Toggle password visibility ─────────────────────────────────────────

  test('toggles password field type when the eye icon is clicked', async ({ page }) => {
    const passwordInput = page.getByLabel(/senha/i)
    await passwordInput.fill('minhaSenha')

    // Initially the input must be type="password" (hidden)
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click the toggle button (eye icon)
    await page.getByRole('button', { name: /mostrar senha/i }).click()

    // Now it must be type="text" (visible)
    await expect(passwordInput).toHaveAttribute('type', 'text')
  })

  // ── 6. Navigation ──────────────────────────────────────────────────────────

  test('has a working link to the register page', async ({ page }) => {
    await page.getByRole('link', { name: /criar conta/i }).click()
    await expect(page).toHaveURL('/register')
  })
})
