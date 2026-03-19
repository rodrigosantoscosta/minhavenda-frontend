# Playwright E2E Testing Guide — MinhaVenda Frontend

This guide covers everything you need to write, run, and maintain E2E tests for this project.
All examples are taken directly from the real codebase (`tests/login.spec.js`, `tests/search.spec.js`).

---

## Table of Contents

1. [Mental model — what E2E tests are for](#1-mental-model)
2. [Project setup recap](#2-project-setup-recap)
3. [Running tests](#3-running-tests)
4. [Anatomy of a spec file](#4-anatomy-of-a-spec-file)
5. [Mocking the backend with page.route()](#5-mocking-the-backend)
6. [Selectors — how to find elements](#6-selectors)
7. [Assertions — what to assert](#7-assertions)
8. [Common patterns in this app](#8-common-patterns)
9. [What to test vs what NOT to test](#9-what-to-test)
10. [Daily workflow](#10-daily-workflow)
11. [Debugging failing tests](#11-debugging)
12. [Rules and anti-patterns](#12-rules-and-anti-patterns)

---

## 1. Mental Model

E2E tests simulate a real user in a real browser. They do **not** know about React
state, component props, or internal functions — they only see what is rendered on screen.

Think of each test as a sentence that describes observed behaviour:

```
"When I type a wrong email and click Entrar, I see 'Email inválido' on the page."
"When I log in successfully, the URL changes to / and my name appears in the header."
```

If you can describe it that way, it belongs in an E2E test.
If you can't (e.g. "validateEmail() returns false"), it belongs in a unit test.

---

## 2. Project Setup Recap

| What | Where / Value |
|---|---|
| Package | `@playwright/test` (already in devDependencies) |
| Config | `playwright.config.js` at the project root |
| Tests | `tests/*.spec.js` |
| Browser | Chromium only |
| Base URL | `http://localhost:5173` |
| Dev server | Auto-started by Playwright before tests |
| Reports | HTML — run `pnpm test:e2e:report` to open |

**First-time only** — install the browser binary:
```bash
pnpm exec playwright install chromium
```

---

## 3. Running Tests

| Command | What it does |
|---|---|
| `pnpm test:e2e` | Run all tests headlessly. Vite starts automatically. |
| `pnpm test:e2e:ui` | Open Playwright UI — watch tests run in a real browser, step through, time-travel |
| `pnpm test:e2e:debug` | Pause on every step with the Inspector |
| `pnpm test:e2e:report` | Open the last HTML report after a run |

> ⚠️ **Do NOT run `pnpm dev` before `pnpm test:e2e`.**
> The `webServer` block in `playwright.config.js` starts Vite automatically.
> If port 5173 is already in use, Playwright will fail to start the server.
>
> Exception: `pnpm test:e2e:ui` — UI mode manages its own server lifecycle.

### Running a single file
```bash
pnpm exec playwright test tests/login.spec.js
```

### Running a single test by name
```bash
pnpm exec playwright test --grep "redirects to home"
```

---

## 4. Anatomy of a Spec File

```js
// @ts-check  ← enables editor type hints (always include this)
import { test, expect } from '@playwright/test'

// ── Mock helpers (at the top, before test.describe) ──────────────────────────
// Keep API mocks as small, named functions so tests read cleanly.
function mockLoginSuccess(page) {
  return page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'fake-jwt', nome: 'João Silva', tipo: 'CLIENTE' }),
    })
  )
}

// ── Test suite ────────────────────────────────────────────────────────────────
test.describe('Login page', () => {

  // Runs before every test in this describe block
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')                                   // relative path — baseURL is prepended
    await expect(page.getByRole('heading', { name: /faça login/i })).toBeVisible()
  })

  test('shows validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page.getByText(/email é obrigatório/i)).toBeVisible()
  })

  test('redirects to home after successful login', async ({ page }) => {
    await mockLoginSuccess(page)                                // mock BEFORE interacting
    await page.getByLabel(/email/i).fill('joao@email.com')
    await page.getByLabel(/senha/i).fill('senha123')
    await page.getByRole('button', { name: /entrar/i }).click()
    await expect(page).toHaveURL('/')                          // assert the outcome
  })
})
```

Key rules visible here:
- Mock helpers are declared **before** `test.describe`, not inside tests.
- `test.beforeEach` handles shared navigation and a "ready" guard.
- Each test is one sentence: one action, one assertion.

---

## 5. Mocking the Backend

**Rule: never call a real API in tests.** Use `page.route()` to intercept every
`/api/...` request and return controlled fake data.

### Basic mock — single endpoint

```js
// Intercept POST /api/auth/login, return a fake token
page.route('**/api/auth/login', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      token: 'fake-jwt-token',
      email: 'joao@email.com',
      nome: 'João Silva',
      tipo: 'CLIENTE',          // must match what AuthContext expects
    }),
  })
)
```

### Paginated API mock (Spring Page shape)

The backend returns Spring's paginated format. Your mock must match exactly:

```js
function fakePage({ pageIndex = 0, totalPages = 3, pageSize = 12 } = {}) {
  const content = Array.from({ length: pageSize }, (_, i) => ({
    id: pageIndex * pageSize + i + 1,
    nome: `Produto ${pageIndex * pageSize + i + 1}`,
    preco: 49.9,
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
    totalElements: totalPages * pageSize,
    number: pageIndex,          // 0-based current page
    size: pageSize,
    first: pageIndex === 0,
    last: pageIndex === totalPages - 1,
    numberOfElements: content.length,
  }
}

// Intercept with page-param awareness
page.route('**/api/produtos**', async (route) => {
  const url = new URL(route.request().url())
  const pageIndex = parseInt(url.searchParams.get('page') ?? '0', 10)
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(fakePage({ pageIndex })),
  })
})
```

### Error mock — simulate backend failure

```js
page.route('**/api/auth/login', (route) =>
  route.fulfill({
    status: 401,
    contentType: 'application/json',
    body: JSON.stringify({ message: 'Credenciais inválidas' }),
  })
)
```

### Empty result mock

```js
page.route('**/api/produtos**', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      content: [], totalPages: 0, totalElements: 0,
      number: 0, size: 12, first: true, last: true, numberOfElements: 0,
    }),
  })
)
```

### Pattern matching

| Pattern | Matches |
|---|---|
| `**/api/auth/login` | Any origin, path ends in `/api/auth/login` |
| `**/api/produtos**` | Path contains `/api/produtos` with any query string |
| `**/api/categorias` | Exact path segment match |

---

## 6. Selectors

Always pick the **most semantic selector available**. This order matters:

### Priority 1 — getByRole (best)
Matches what a screen reader sees. Most resilient to CSS/layout changes.

```js
page.getByRole('button', { name: /entrar/i })       // a <button> with text "Entrar"
page.getByRole('link', { name: /criar conta/i })     // an <a> tag
page.getByRole('heading', { name: /faça login/i })   // an <h1>/<h2>/etc
page.getByRole('textbox', { name: /email/i })        // input associated with a label
```

### Priority 2 — getByLabel
Matches an input by its `<label>` text. Requires labels to be properly associated.

```js
page.getByLabel(/email/i)       // finds the <input> whose label contains "email"
page.getByLabel(/senha/i)       // works with htmlFor, aria-label, aria-labelledby
```

### Priority 3 — getByText
Matches any visible element containing that text.

```js
page.getByText(/email é obrigatório/i)     // validation error message
page.getByText(/36 produto/i)              // result count text
```

### Priority 4 — getByPlaceholder
Use when no label exists (e.g. the header search bar).

```js
page.getByPlaceholder(/buscar produtos/i)
```

### Priority 5 — getByTestId (last resort)
Requires you to add `data-testid` to the source component.

```js
// In the component:
<div data-testid="product-card">...</div>

// In the test:
page.getByTestId('product-card')
```

Only add `data-testid` when no semantic selector works. Prefix with nothing —
just use descriptive names like `product-card`, `cart-total`, `order-status`.

### Dealing with multiple matches

If `getByText` matches more than one element:

```js
page.getByText(/filtros/i).first()          // take the first match
page.getByPlaceholder(/buscar/i).first()    // header has two SearchBars (desktop + mobile)
```

---

## 7. Assertions

All assertions use `expect()` from `@playwright/test`. They **auto-wait** up to
the configured timeout — you never need `waitForTimeout()`.

### Visibility

```js
await expect(locator).toBeVisible()       // element exists and is visible
await expect(locator).not.toBeVisible()   // element is hidden or absent
```

### URL

```js
await expect(page).toHaveURL('/')                    // exact match
await expect(page).toHaveURL('/login')
await expect(page).toHaveURL(/\/busca\?q=notebook/)  // regex match
await expect(page).toHaveURL(/page=1/)               // query param check
```

### Element state

```js
await expect(locator).toBeEnabled()
await expect(locator).toBeDisabled()
await expect(locator).toHaveAttribute('type', 'password')
await expect(locator).toHaveAttribute('type', 'text')
```

### Text content

```js
await expect(locator).toHaveText(/36 produto/i)       // contains text (regex)
await expect(locator).toContainText('João')
```

### Count

```js
await expect(page.getByRole('article')).toHaveCount(12)
```

---

## 8. Common Patterns in This App

### Pattern A — Login then test authenticated page

```js
async function loginAs(page, tipo = 'cliente') {
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'fake-jwt',
        nome: tipo === 'admin' ? 'Admin User' : 'João Silva',
        email: tipo === 'admin' ? 'admin@loja.com' : 'joao@email.com',
        tipo: tipo === 'admin' ? 'ADMIN' : 'CLIENTE',
      }),
    })
  )
  await page.goto('/login')
  await page.getByLabel(/email/i).fill('joao@email.com')
  await page.getByLabel(/senha/i).fill('senha123')
  await page.getByRole('button', { name: /entrar/i }).click()
  await expect(page).toHaveURL('/')     // wait for redirect
}

test('authenticated user can view orders', async ({ page }) => {
  await loginAs(page)
  await page.goto('/pedidos')
  await expect(page.getByRole('heading', { name: /meus pedidos/i })).toBeVisible()
})
```

### Pattern B — Test mobile viewport

```js
test('filter button is visible on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })  // iPhone 14
  await page.goto('/busca?q=produto')
  await expect(page.getByRole('button', { name: /filtros/i })).toBeVisible()
})
```

### Pattern C — Assert URL state after interaction

```js
test('pagination updates the URL', async ({ page }) => {
  await page.goto('/busca?q=produto')
  await page.getByRole('button', { name: /próxima/i }).click()
  await expect(page).toHaveURL(/page=1/)
})
```

### Pattern D — Test empty / error state

```js
test('shows empty state when API returns nothing', async ({ page }) => {
  await page.route('**/api/produtos**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ content: [], totalPages: 0, totalElements: 0,
        number: 0, size: 12, first: true, last: true, numberOfElements: 0 }) })
  )
  await page.goto('/busca?q=nada')
  await expect(page.getByText(/nenhum produto encontrado/i)).toBeVisible()
})
```

### Pattern E — Test add to cart flow

```js
test('adding a product to cart updates the cart badge', async ({ page }) => {
  // Mock the product detail endpoint
  await page.route('**/api/produtos/1', (route) =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ id: 1, nome: 'Notebook', preco: 3999.90,
        quantidadeEstoque: 5, ativo: true }),
    })
  )

  await page.goto('/produto/1')
  await page.getByRole('button', { name: /adicionar ao carrinho/i }).click()

  // Cart badge in the header should show "1"
  await expect(page.getByText('1').first()).toBeVisible()
})
```

---

## 9. What to Test vs What NOT to Test

### ✅ Test at the E2E layer

| Scenario | Why E2E? |
|---|---|
| Form validation messages appear | User-visible; depends on full render |
| Redirect after login | Requires router + auth state |
| URL updates on filter/pagination | URL is the user's state |
| Cart badge increments | Requires global context |
| Mobile layout changes | Requires real viewport |
| Empty state renders | Requires API mock + render |
| Protected route redirects to login | Requires auth guard |
| Error banner on 401/500 | Requires intercepted response |

### ❌ Do NOT test at the E2E layer

| Scenario | Test it where instead |
|---|---|
| `formatarPreco(1234.5)` returns `"R$ 1.234,50"` | Unit test (Vitest) |
| `validateEmail('foo')` returns false | Unit test |
| `fakePage()` helper builds correct shape | Unit test |
| Component renders with correct props | Component test (Vitest + Testing Library) |
| CSS classes applied to an element | Don't test styling |

---

## 10. Daily Workflow

This is the step-by-step flow for adding tests to a new feature:

```
1. Build your feature (component + page)

2. Create tests/my-feature.spec.js
   - Add mock helpers at the top
   - Write test.describe block
   - Write 3–6 tests covering: renders, user action, error state

3. Run in UI mode to watch tests execute:
   pnpm test:e2e:ui

4. Fix anything that fails — use the time-travel debugger in UI mode

5. Run headless to confirm clean pass:
   pnpm test:e2e

6. Commit spec alongside the feature:
   git add tests/my-feature.spec.js src/pages/MyFeature.jsx
   git commit -m "feat(my-feature): add X with e2e coverage"
```

### Which tests to write first (priority order)

1. **Happy path** — the main user journey works end-to-end
2. **Error state** — what the user sees when the API fails or returns empty
3. **Validation** — client-side form errors appear correctly
4. **Navigation** — links and redirects go to the right URLs
5. **Mobile** — critical flows work at 390px viewport

---

## 11. Debugging

### Use UI mode first

```bash
pnpm test:e2e:ui
```

UI mode gives you:
- A live browser panel showing the test running
- Time-travel: click any step to see what the page looked like at that moment
- The locator picker (find selectors by clicking on elements)
- Network request log (verify your mocks are intercepting correctly)

### Use debug mode for step-by-step

```bash
pnpm test:e2e:debug
```

Pauses before every `await` — you can step forward and inspect the browser.

### Check the HTML report after a headless run

```bash
pnpm test:e2e:report
```

Each failed test shows:
- Screenshot at the point of failure
- Trace (if `trace: 'on-first-retry'` fired on a retry)
- The exact assertion that failed and the actual value

### Common failure reasons

| Symptom | Likely cause | Fix |
|---|---|---|
| `Timeout waiting for locator` | Element never appeared | Check mock is intercepting; check selector |
| `strict mode violation: locator resolved to N elements` | Selector matches multiple elements | Use `.first()` or a more specific selector |
| `Expected URL to be X, received Y` | Redirect didn't happen | Verify mock response shape matches what AuthContext expects |
| Test passes in UI mode, fails headless | Timing issue | Replace any `waitForTimeout` with a proper `expect().toBeVisible()` |
| Mock not intercepting | Pattern too strict | Use `**/api/auth/login` (double `**`) not `/api/auth/login` |

---

## 12. Rules and Anti-Patterns

### ✅ Do

```js
// Wait for visible elements
await expect(page.getByText(/carregando/i)).not.toBeVisible()

// Use regex for text (case-insensitive, partial match)
page.getByText(/email é obrigatório/i)

// Mock before navigating
await mockLoginSuccess(page)
await page.goto('/login')

// Assert URL after navigation
await expect(page).toHaveURL('/')
```

### ❌ Never do

```js
// ❌ Sleep — flaky and slow
await page.waitForTimeout(2000)

// ❌ test.only — breaks CI (forbidOnly: true)
test.only('my test', ...)

// ❌ Real API calls — tests become order-dependent and slow
await page.goto('/busca')  // without mocking /api/produtos

// ❌ Assert implementation details
expect(component.state.isLoading).toBe(false)  // not possible in E2E anyway

// ❌ Hardcoded absolute URLs
await page.goto('http://localhost:5173/login')  // use '/login' — baseURL handles the rest

// ❌ Exact string matching on backend messages (they change)
await expect(page.getByText('Credenciais inválidas')).toBeVisible()  // use regex instead
await expect(page.getByText(/credenciais inválidas/i)).toBeVisible() // ✅
```

---

## Spec files in this project

| File | What it covers |
|---|---|
| `tests/login.spec.js` | Login form validation, success/failure flow, password toggle, register link |
| `tests/search.spec.js` | Product grid, result count, empty state, pagination + URL, mobile filters |
| `tests/scrollTop-pagination.spec.js` | Scroll-to-top behaviour on page change (window.scrollTo spy) |

When you add a new page or significant feature, add a corresponding `tests/<feature>.spec.js`.
