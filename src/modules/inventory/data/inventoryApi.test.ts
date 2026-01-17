import { describe, expect, it, vi } from 'vitest'
import { listInventoryBatches } from './inventoryApi'

vi.mock('@/lib/supabase/client', () => ({
  supabaseClient: {
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    from: vi.fn((table: string) => {
      if (table === 'stock_batches') {
        return {
          select: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'batch-1',
                qty_on_hand: 3,
                expires_at: '2026-02-01T10:00:00.000Z',
                inventory_locations: { id: 'loc-1', name: 'Almacen' },
                supplier_items: { name: 'Harina' }
              }
            ],
            error: null
          })
        }
      }
      if (table === 'expiry_alerts') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            data: [{ id: 'alert-1', batch_id: 'batch-1', severity: 'warning', status: 'open' }],
            error: null
          })
        }
      }
      if (table === 'expiry_rules') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: [{ threshold_days: 7, severity: 'warning' }],
            error: null
          })
        }
      }
      return {
        select: vi.fn().mockResolvedValue({ data: [], error: null }),
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      }
    })
  }
}))

describe('listInventoryBatches', () => {
  it('maps batches with status', async () => {
    const data = await listInventoryBatches()

    expect(data).toHaveLength(1)
    expect(data[0].itemName).toBe('Harina')
    expect(data[0].locationName).toBe('Almacen')
    expect(data[0].locationId).toBe('loc-1')
    expect(data[0].status).toBe('warning')
  })
})
