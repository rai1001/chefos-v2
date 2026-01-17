import { describe, expect, it, vi } from 'vitest'
import { fetchDashboardData } from './dashboardRpc'
import { supabaseClient } from '@/lib/supabase/client'

vi.mock('@/lib/supabase/client', () => ({
  supabaseClient: {
    rpc: vi.fn()
  }
}))

describe('fetchDashboardData', () => {
  it('maps rpc payloads into dashboard data', async () => {
    const rpcMock = supabaseClient.rpc as unknown as ReturnType<typeof vi.fn>

    rpcMock
      .mockResolvedValueOnce({
        data: [
          {
            event_id: 'event-1',
            title: 'Evento Uno',
            starts_at: '2026-01-01T10:00:00Z',
            status: 'confirmed',
            hotel_name: 'Hotel Central'
          }
        ],
        error: null
      })
      .mockResolvedValueOnce({
        data: [
          { day: '2026-01-01', events_count: 2 },
          { day: '2026-01-02', events_count: 0 }
        ],
        error: null
      })

    const data = await fetchDashboardData()

    expect(data.highlights).toHaveLength(1)
    expect(data.rollingGrid).toHaveLength(2)
    expect(data.kpis[0].value).toBe(2)
  })
})
