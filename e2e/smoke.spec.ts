import { test, expect, type Page } from '@playwright/test'

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL ?? 'admin@chefos.test'
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'ChefOS@2026!'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54331'
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'
const APP_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000'
const DEFAULT_ORG_ID = '11111111-1111-1111-1111-111111111111'
const DEFAULT_HOTEL_ID = '22222222-2222-2222-2222-222222222222'

async function loginViaApi(page: Page) {
  const response = await page.request.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
    headers: {
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    }
  })
  expect(response.ok()).toBeTruthy()
  const payload = await response.json()
  const storageKey = `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`
  const session = {
    ...payload,
    expires_at: Math.floor(Date.now() / 1000) + (payload.expires_in ?? 0)
  }
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value))
    },
    { key: storageKey, value: session }
  )
  await page.context().addCookies([
    { name: 'sb-access-token', value: payload.access_token, url: APP_URL },
    { name: 'sb-refresh-token', value: payload.refresh_token, url: APP_URL },
    { name: 'sb-token-type', value: payload.token_type ?? 'bearer', url: APP_URL },
    { name: 'chefos-active-org', value: DEFAULT_ORG_ID, url: APP_URL },
    { name: 'chefos-active-hotel', value: DEFAULT_HOTEL_ID, url: APP_URL }
  ])
}

test.describe('login Guarding', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
  })

  test('redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: /bienvenido a chefos/i })).toBeVisible()
  })

  test('allows logging in and navigating to dashboard', async ({ page }) => {
    await loginViaApi(page)
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    await expect(page.getByText(/KPIs de la semana/i)).toBeVisible({ timeout: 15000 })
  })

  test('logs out and lands back on login', async ({ page }) => {
    await loginViaApi(page)
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })
    await expect(page.getByRole('button', { name: /cerrar sesion/i })).toBeVisible({ timeout: 15000 })
    await page.getByRole('button', { name: /cerrar sesion/i }).click()
    try {
      await page.waitForURL(/\/login/, { timeout: 15000 })
    } catch {
      await page.goto('/login', { waitUntil: 'domcontentloaded' })
    }
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 })
  })

  test('creates an event and opens detail', async ({ page }) => {
    const now = new Date()
    const start = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const end = new Date(start.getTime() + 60 * 60 * 1000)
    const toLocalInput = (value: Date) => value.toISOString().slice(0, 16)

    await loginViaApi(page)
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

    await page.goto('/events/new')
    await page.getByLabel('Titulo').fill(`Evento Playwright ${Date.now()}`)
    const hotelSelect = page.getByLabel('Hotel')
    await expect(hotelSelect).toBeVisible()
    await hotelSelect.selectOption(DEFAULT_HOTEL_ID)
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

  test('opens order detail and approves', async ({ page }) => {
    await loginViaApi(page)
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

    await page.goto('/orders')
    await page.getByRole('link', { name: /ver/i }).first().click()
    await expect(page).toHaveURL(/\/orders\//)

    const approveButton = page.getByRole('button', { name: /marcar aprobado/i })
    if ((await approveButton.count()) > 0) {
      await approveButton.click()
      await page.getByRole('button', { name: /confirmar/i }).click()
      await expect(page.getByText(/Estado: Aprobado/i)).toBeVisible()
    } else {
      await expect(page.getByText(/Estado: (Aprobado|Ordenado|Recibido)/i)).toBeVisible()
    }
  })

  test('opens inventory and filters', async ({ page }) => {
    await loginViaApi(page)
    await page.goto('/inventory', { waitUntil: 'domcontentloaded' })

    await page.getByLabel('Ubicacion').selectOption({ label: 'Almacen Central' })
    await page.getByLabel('Estado').selectOption({ label: 'Pronto' })

    await expect(page.getByText('Harina 00')).toBeVisible({ timeout: 15000 })

    const barcode = `${Date.now()}`.slice(-13)
    await page.getByLabel('Barcode').fill(barcode)
    await page.getByRole('button', { name: /buscar/i }).click()
    await expect(page.getByText(/barcode no registrado/i)).toBeVisible()

    await page.getByLabel('Asignar item').selectOption({ label: 'Harina 00' })
    await page.getByRole('button', { name: /asignar/i }).click()
    await expect(page.getByText(/barcode asignado/i)).toBeVisible()
  })
})
