import { test, expect } from '@playwright/test'

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL ?? 'admin@chefos.test'
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'ChefOS@2026!'

test.describe('login Guarding', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
  })

  test('redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: /bienvenido a chefos/i })).toBeVisible()
  })

  test('allows logging in and navigating to dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('chef@empresa.com').fill(TEST_EMAIL)
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.getByText(/KPIs de la semana/i)).toBeVisible()
  })

  test('logs out and lands back on login', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('chef@empresa.com').fill(TEST_EMAIL)
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page.getByRole('button', { name: /Cerrar sesión/i })).toBeVisible()
    await page.getByRole('button', { name: /Cerrar sesión/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })
})
