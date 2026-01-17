import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useActiveOrg } from './useActiveOrg'

vi.mock('@/lib/supabase/client', () => {
  return {
    supabaseClient: {
      from: (table: string) => {
        const base = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockImplementation(() =>
            Promise.resolve({
              data: table === 'hotels' ? [{ id: 'hotel-1', name: 'Hotel Central' }] : [],
              error: null
            })
          ),
          single: vi.fn().mockImplementation(() =>
            Promise.resolve({
              data: table === 'orgs' ? { name: 'ChefOS Owners' } : null,
              error: null
            })
          )
        }
        return base
      }
    }
  }
})

describe('useActiveOrg hook', () => {
  it('loads hotels and org name from the active org cookie', async () => {
    document.cookie = 'chefos-active-org=11111111-1111-1111-1111-111111111111'

    const { result } = renderHook(() => useActiveOrg())

    await waitFor(() => {
      expect(result.current.hotels).toHaveLength(1)
    })

    expect(result.current.orgName).toBe('ChefOS Owners')
    expect(document.cookie).toContain('chefos-active-hotel=hotel-1')
  })
  afterEach(() => {
    document.cookie = ''
  })
})
