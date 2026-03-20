// @ts-check
import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright test configuration for minhavenda-frontend.
 *
 * - Targets: Chromium only (fast local feedback)
 * - baseURL: http://localhost:5173 (Vite dev port)
 * - webServer: auto-starts `pnpm dev` before the test run and waits for the
 *   server to be ready. The server must NOT already be running when you run
 *   `pnpm test:e2e` — Playwright will own the process lifecycle.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  /* Run test files in parallel */
  fullyParallel: true,

  /* Fail CI if test.only is accidentally committed */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Single worker on CI to avoid port conflicts; auto on local */
  workers: process.env.CI ? 1 : undefined,

  /* HTML report — open with: pnpm exec playwright show-report */
  reporter: [['html', { open: 'never' }]],

  use: {
    /* All page.goto('') calls resolve against this base */
    baseURL: 'http://localhost:5173',

    /* Capture trace on first retry to aid debugging */
    trace: 'on-first-retry',

    /* Record screenshots only on failure */
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /**
   * Auto-start the Vite dev server before the test suite.
   * Playwright waits until http://localhost:5173 responds before running tests.
   * Do NOT start the dev server manually — let Playwright manage it.
   */
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
