import { describe, expect, it, vi } from 'vitest'
import { listEvents } from './eventsApi'
import { supabaseClient } from '@/lib/supabase/client'

vi.mock('@/lib/supabase/client', () => ({
  supabaseClient: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'event-1',
            title: 'Evento Uno',
            starts_at: '2026-01-01T10:00:00Z',
            ends_at: '2026-01-01T11:00:00Z',
            status: 'draft',
            hotel_id: 'hotel-1',
            hotels: { name: 'Hotel Central' }
          }
        ],
        error: null
      })
    }))
  }
}))

describe('listEvents', () => {
  it('maps event rows into list items', async () => {
    const data = await listEvents()

    expect(data).toHaveLength(1)
    expect(data[0].title).toBe('Evento Uno')
    expect(data[0].hotelName).toBe('Hotel Central')
  })
})
