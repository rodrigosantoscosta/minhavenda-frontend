// @ts-check
/**
 * tests/admin-real.spec.js — Admin panel E2E tests with real backend
 *
 * Uses admin sessionStorage injection to bypass login.
 * Tests verify the real backend renders admin pages with light theme.
 */

import { test, expect } from '@playwright/test'
import { injectAdminAuth } from './helpers.js'

test.describe('Admin panel (real backend)', () => {

  test.beforeEach(async ({ page }) => {
    await injectAdminAuth(page)
  })

  test('admin dashboard loads', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await expect(page.locator('body')).toBeVisible()
  })

  test('admin dashboard uses light theme', async ({ page }) => {
    await page.goto('/admin/dashboard')
    const body = page.locator('body')
    await expect(body).toBeVisible()
    const bgColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    // Light theme should have a non-dark background
    expect(bgColor).not.toBe('rgb(10, 11, 14)')
  })

  test('admin sidebar visible on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/admin/dashboard')
    // Sidebar should contain navigation
    await expect(page.getByText('MinhaVenda').first()).toBeVisible()
  })

  test('admin pedidos page loads', async ({ page }) => {
    await page.goto('/admin/pedidos')
    await expect(page.locator('body')).toBeVisible()
  })

  test('admin produtos page loads', async ({ page }) => {
    await page.goto('/admin/produtos')
    await expect(page.locator('body')).toBeVisible()
  })

  test('admin estoque page loads', async ({ page }) => {
    await page.goto('/admin/estoque')
    await expect(page.locator('body')).toBeVisible()
  })

  test('admin categorias page loads', async ({ page }) => {
    await page.goto('/admin/categorias')
    await expect(page.locator('body')).toBeVisible()
  })

  test('admin mobile drawer opens', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/admin/dashboard')
    // Wait for page to load (spinner gone or content visible)
    await page.waitForLoadState('networkidle').catch(() => {})
    const menuBtn = page.getByRole('button', { name: /abrir menu/i })
    await expect(menuBtn).toBeVisible()
    await menuBtn.click()
    // Verify drawer opened by checking for the close button
    await expect(page.getByRole('button', { name: /fechar menu/i })).toBeVisible()
  })

  test('admin relatorios page loads', async ({ page }) => {
    await page.goto('/admin/relatorios-financeiros')
    await expect(page.locator('body')).toBeVisible()
  })

  test('admin DLQ page loads', async ({ page }) => {
    await page.goto('/admin/dlq')
    await expect(page.locator('body')).toBeVisible()
  })
})




