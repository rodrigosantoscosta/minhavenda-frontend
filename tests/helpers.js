// @ts-check
/**
 * tests/helpers.js — Shared helpers for real-backend E2E tests
 */

/**
 * Creates a fake JWT token that expires in 1 hour.
 * JWT structure: header.payload.signature (base64url encoded)
 */
function createFakeToken(user) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role || 'USER',
    iat: now,
    exp: now + 3600, // 1 hour from now
  }
  const b64 = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return b64(header) + '.' + b64(payload) + '.fakesignature'
}

/**
 * Injects auth data into localStorage using the same keys as authService.
 * This bypasses the login flow and makes AuthContext think the user is logged in.
 */
export async function injectAuth(page, user = { id: '1', nome: 'Test User', email: 'test@minhavenda.com', role: 'USER' }) {
  const token = createFakeToken(user)
  await page.addInitScript((data) => {
    window.localStorage.setItem('token', data.token)
    window.localStorage.setItem('user', JSON.stringify(data.user))
    window.localStorage.setItem('tokenExpiration', data.expiration.toString())
  }, {
    token,
    user,
    expiration: Date.now() + 3600000,
  })
}

/**
 * Injects admin auth into localStorage.
 */
export async function injectAdminAuth(page) {
  await injectAuth(page, { id: '1', nome: 'Admin User', email: 'admin@minhavenda.com', role: 'ADMIN' })
}

/**
 * Logs in via the UI using real backend credentials.
 */
export async function loginViaUI(page, email, password) {
  await page.goto('/login')
  await page.getByLabel(/e-mail/i).fill(email)
  await page.getByLabel(/senha/i).fill(password)
  await page.getByRole('button', { name: /entrar/i }).click()
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 10000 })
}
