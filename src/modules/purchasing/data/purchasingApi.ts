import { supabaseClient } from '@/lib/supabase/client'
import {
  PurchaseOrderDetail,
  PurchaseOrderLine,
  PurchaseOrderListItem,
  PurchaseStatus,
  Supplier,
  SupplierItem
} from '../domain/types'
import { calculateNetToBuy, calculateRoundedQty } from '../domain/netToBuy'

interface SupplierRow {
  id: string
  name: string
  contact_email?: string | null
  contact_phone?: string | null
}

interface SupplierItemRow {
  id: string
  name: string
  purchase_unit: string
  pack_size?: number | null
  unit_price?: number | null
}

interface PurchaseOrderRow {
  id: string
  status: PurchaseStatus
  total_estimated?: number | null
  suppliers?: { name: string } | { name: string }[] | null
  hotels?: { name: string } | { name: string }[] | null
}

interface PurchaseOrderLineRow {
  id: string
  supplier_item_id: string
  requested_qty: number
  received_qty: number
  unit_price?: number | null
  rounding_rule?: string | null
  pack_size?: number | null
  supplier_items?: { name: string } | { name: string }[] | null
}

interface StockLevelRow {
  supplier_item_id: string
  on_hand: number
  available_on_hand: number
  consider_reservations: boolean
}

const resolveName = (value?: { name: string } | { name: string }[] | null) =>
  Array.isArray(value) ? value[0]?.name ?? null : value?.name ?? null

export async function listSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabaseClient.from('suppliers').select('id, name, contact_email, contact_phone')
  if (error) throw new Error(error.message)
  return ((data as unknown as SupplierRow[]) ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    contactEmail: row.contact_email ?? null,
    contactPhone: row.contact_phone ?? null
  }))
}

export async function createSupplier(payload: {
  orgId: string
  name: string
  contactEmail?: string
  contactPhone?: string
}): Promise<Supplier> {
  const { data, error } = await supabaseClient
    .from('suppliers')
    .insert({
      org_id: payload.orgId,
      name: payload.name,
      contact_email: payload.contactEmail ?? null,
      contact_phone: payload.contactPhone ?? null
    })
    .select('id, name, contact_email, contact_phone')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'No se pudo crear el proveedor')

  const row = data as SupplierRow
  return {
    id: row.id,
    name: row.name,
    contactEmail: row.contact_email ?? null,
    contactPhone: row.contact_phone ?? null
  }
}

export async function listSupplierItems(supplierId: string): Promise<SupplierItem[]> {
  const { data, error } = await supabaseClient
    .from('supplier_items')
    .select('id, name, purchase_unit, pack_size, unit_price')
    .eq('supplier_id', supplierId)
    .order('name')

  if (error) throw new Error(error.message)

  return ((data as unknown as SupplierItemRow[]) ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    purchaseUnit: row.purchase_unit,
    packSize: row.pack_size ?? null,
    unitPrice: row.unit_price ?? null
  }))
}

export async function createSupplierItem(payload: {
  orgId: string
  supplierId: string
  name: string
  purchaseUnit: string
  packSize?: number | null
  unitPrice?: number | null
}): Promise<SupplierItem> {
  const { data, error } = await supabaseClient
    .from('supplier_items')
    .insert({
      org_id: payload.orgId,
      supplier_id: payload.supplierId,
      name: payload.name,
      purchase_unit: payload.purchaseUnit,
      pack_size: payload.packSize ?? null,
      unit_price: payload.unitPrice ?? null
    })
    .select('id, name, purchase_unit, pack_size, unit_price')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'No se pudo crear el item')

  const row = data as SupplierItemRow
  return {
    id: row.id,
    name: row.name,
    purchaseUnit: row.purchase_unit,
    packSize: row.pack_size ?? null,
    unitPrice: row.unit_price ?? null
  }
}

export async function listPurchaseOrders(): Promise<PurchaseOrderListItem[]> {
  const { data, error } = await supabaseClient
    .from('purchase_orders')
    .select('id, status, total_estimated, suppliers(name), hotels(name)')
    .order('status')

  if (error) throw new Error(error.message)

  return ((data as unknown as PurchaseOrderRow[]) ?? []).map((row) => ({
    id: row.id,
    status: row.status,
    totalEstimated: row.total_estimated ?? null,
    supplierName: resolveName(row.suppliers),
    hotelName: resolveName(row.hotels)
  }))
}

export async function getPurchaseOrderDetail(orderId: string): Promise<PurchaseOrderDetail> {
  const { data: order, error } = await supabaseClient
    .from('purchase_orders')
    .select('id, status, total_estimated, suppliers(name), hotels(name)')
    .eq('id', orderId)
    .single()

  if (error || !order) throw new Error(error?.message ?? 'Pedido no encontrado')

  const { data: lines, error: linesError } = await supabaseClient
    .from('purchase_order_lines')
    .select('id, supplier_item_id, requested_qty, received_qty, unit_price, rounding_rule, pack_size, supplier_items(name)')
    .eq('purchase_order_id', orderId)

  if (linesError) throw new Error(linesError.message)

  const orderRow = order as PurchaseOrderRow
  const lineRows = (lines as unknown as PurchaseOrderLineRow[]) ?? []
  const supplierItemIds = lineRows.map((row) => row.supplier_item_id)
  const stockByItem = new Map<string, StockLevelRow>()

  if (supplierItemIds.length > 0) {
    const { data: stockLevels, error: stockError } = await supabaseClient
      .from('stock_levels')
      .select('supplier_item_id, on_hand, available_on_hand, consider_reservations')
      .in('supplier_item_id', supplierItemIds)

    if (stockError) throw new Error(stockError.message)

    ;((stockLevels as unknown as StockLevelRow[]) ?? []).forEach((row) => {
      stockByItem.set(row.supplier_item_id, row)
    })
  }

  return {
    id: orderRow.id,
    status: orderRow.status,
    totalEstimated: orderRow.total_estimated ?? null,
    supplierName: resolveName(orderRow.suppliers),
    hotelName: resolveName(orderRow.hotels),
    lines: lineRows.map<PurchaseOrderLine>((row) => {
      const stock = stockByItem.get(row.supplier_item_id)
      const onHand = stock?.on_hand ?? 0
      const availableOnHand = stock?.available_on_hand ?? onHand
      const reserved = stock?.consider_reservations ? Math.max(onHand - availableOnHand, 0) : 0
      const netToBuy = calculateNetToBuy(row.requested_qty, availableOnHand)
      const roundedQty = calculateRoundedQty(netToBuy, row.rounding_rule ?? 'none', row.pack_size ?? null)

      return {
        id: row.id,
        supplierItemId: row.supplier_item_id,
        supplierItemName: resolveName(row.supplier_items),
        requestedQty: row.requested_qty,
        receivedQty: row.received_qty,
        unitPrice: row.unit_price ?? null,
        roundingRule: row.rounding_rule ?? null,
        packSize: row.pack_size ?? null,
        onHand,
        reserved,
        availableOnHand,
        netToBuy,
        roundedQty
      }
    })
  }
}

export async function updatePurchaseOrderStatus(orderId: string, status: PurchaseStatus): Promise<void> {
  const { error } = await supabaseClient.from('purchase_orders').update({ status }).eq('id', orderId)
  if (error) throw new Error(error.message)
}

export async function receivePurchaseOrder(orderId: string): Promise<void> {
  const { error } = await supabaseClient.rpc('receive_purchase_order', { p_order_id: orderId })
  if (error) throw new Error(error.message)
}
