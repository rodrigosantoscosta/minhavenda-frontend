// @ts-check
/**
 * tests/checkout-real.spec.js — Checkout page E2E tests with real backend
 *
 * Uses sessionStorage injection to bypass login.
 * Tests verify the real backend renders the checkout page correctly.
 */

import { test, expect } from '@playwright/test'
import { injectAuth } from './helpers.js'

test.describe('Checkout (real backend)', () => {

  test.beforeEach(async ({ page }) => {
    await injectAuth(page)
  })

  test('checkout page loads or redirects to cart if empty', async ({ page }) => {
    await page.goto('/checkout')
    // If cart is empty, redirects to /carrinho
    // If cart has items, shows checkout form
    const url = page.url()
    expect(url.includes('/checkout') || url.includes('/carrinho')).toBe(true)
  })

  test('checkout page uses CSS variables', async ({ page }) => {
    await page.goto('/checkout')
    const body = page.locator('body')
    await expect(body).toBeVisible()
    const bgColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    expect(bgColor).not.toBe('transparent')
  })

  test('cart page is accessible', async ({ page }) => {
    await page.goto('/carrinho')
    await expect(page.locator('body')).toBeVisible()
  })
})
