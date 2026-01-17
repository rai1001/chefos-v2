export type ExpirySeverity = 'warning' | 'critical'
export type ExpiryStatus = 'ok' | 'warning' | 'critical'

export interface InventoryBatch {
  id: string
  locationId: string
  itemName: string
  locationName: string
  qtyOnHand: number
  expiresAt: string | null
  status: ExpiryStatus
}

export interface InventoryFilters {
  locationId: string
  status: ExpiryStatus | 'all'
}
