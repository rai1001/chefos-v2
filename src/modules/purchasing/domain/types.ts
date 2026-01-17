export type PurchaseStatus = 'draft' | 'approved' | 'ordered' | 'received'

export interface Supplier {
  id: string
  name: string
  contactEmail?: string | null
  contactPhone?: string | null
}

export interface SupplierItem {
  id: string
  name: string
  purchaseUnit: string
  packSize?: number | null
  unitPrice?: number | null
}

export interface PurchaseOrderListItem {
  id: string
  status: PurchaseStatus
  supplierName?: string | null
  hotelName?: string | null
  totalEstimated?: number | null
}

export interface PurchaseOrderLine {
  id: string
  supplierItemId: string
  supplierItemName?: string | null
  requestedQty: number
  receivedQty: number
  unitPrice?: number | null
  roundingRule?: string | null
  packSize?: number | null
}

export interface PurchaseOrderDetail {
  id: string
  status: PurchaseStatus
  supplierName?: string | null
  hotelName?: string | null
  totalEstimated?: number | null
  lines: PurchaseOrderLine[]
}
