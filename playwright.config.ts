import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: {
    timeout: 5_000
  },
  fullyParallel: true,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 0,
    ignoreHTTPSErrors: true
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'node scripts/seed-auth.mjs && npx pnpm dev',
    port: 3000,
    reuseExistingServer: true,
    timeout: 120_000,
    stdout: 'pipe',
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54331',
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
      SUPABASE_URL: process.env.SUPABASE_URL ?? 'http://127.0.0.1:54331',
      SUPABASE_SERVICE_ROLE_KEY:
        process.env.SUPABASE_SERVICE_ROLE_KEY ??
        'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz',
      TEST_USER_EMAIL: process.env.PW_TEST_USER_EMAIL ?? process.env.TEST_USER_EMAIL ?? 'admin@chefos.test',
      TEST_USER_PASSWORD:
        process.env.PW_TEST_USER_PASSWORD ?? process.env.TEST_USER_PASSWORD ?? 'ChefOS@2026!',
      HOST: '127.0.0.1'
    }
  }
})
