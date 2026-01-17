import { test, expect } from '@playwright/test'

test('login placeholder renders and dashboard link redirects to login', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: /bienvenido a chefos/i })).toBeVisible()
  const dashboardLink = page.getByRole('link', { name: /ver dashboard/i })
  await dashboardLink.click()
  await expect(page).toHaveURL(/\/login/)
})
