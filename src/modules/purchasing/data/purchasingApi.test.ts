import { describe, expect, it, vi } from 'vitest'
import { listPurchaseOrders } from './purchasingApi'

vi.mock('@/lib/supabase/client', () => ({
  supabaseClient: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'order-1',
            status: 'draft',
            total_estimated: 42.5,
            suppliers: { name: 'Proveedor Norte' },
            hotels: { name: 'Hotel Central' }
          }
        ],
        error: null
      })
    }))
  }
}))

describe('listPurchaseOrders', () => {
  it('maps purchase orders', async () => {
    const data = await listPurchaseOrders()

    expect(data).toHaveLength(1)
    expect(data[0].supplierName).toBe('Proveedor Norte')
    expect(data[0].status).toBe('draft')
  })
})
