import '@testing-library/jest-dom'
import { vi } from 'vitest'

process.env.NEXT_PUBLIC_SUPABASE_URL ??= 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??= 'anon-key'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() })
}))

const authMock = () => ({
  session: null,
  user: null,
  signIn: vi.fn(async () => ({ error: null })),
  signOut: vi.fn(async () => undefined)
})

vi.mock('@/providers', () => ({
  useAuth: authMock
}))

vi.mock('@/providers/AuthProvider', () => ({
  useAuth: authMock
}))
