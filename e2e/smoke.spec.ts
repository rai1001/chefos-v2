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

  test('creates an event and opens detail', async ({ page }) => {
    const now = new Date()
    const start = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    const toLocalInput = (value: Date) => value.toISOString().slice(0, 16)

    await page.goto('/login')
    await page.getByPlaceholder('chef@empresa.com').fill(TEST_EMAIL)
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page).toHaveURL(/\/dashboard/)

    await page.goto('/events/new')
    await page.getByLabel('Titulo').fill(`Evento Playwright ${Date.now()}`)
    await page.getByLabel('Hotel').selectOption({ label: 'Hotel Central' })
    await page.getByLabel('Inicio').fill(toLocalInput(start))
    await page.getByLabel('Fin').fill(toLocalInput(end))
    await page.getByRole('button', { name: /siguiente/i }).click()

    await page.getByRole('radio', { name: /Salon Azul/i }).check()
    await page.getByLabel('Inicio reserva').fill(toLocalInput(start))
    await page.getByLabel('Fin reserva').fill(toLocalInput(end))
    await page.getByRole('button', { name: /siguiente/i }).click()

    await page.getByRole('button', { name: /siguiente/i }).click()
    await page.getByRole('button', { name: /crear evento/i }).click()

    await expect(page).toHaveURL(/\/events\//)
    await expect(page.getByText(/Servicios/i)).toBeVisible()
  })
})
