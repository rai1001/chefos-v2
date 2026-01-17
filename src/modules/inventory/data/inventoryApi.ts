import { supabaseClient } from '@/lib/supabase/client'
import { getExpiryStatus } from '../domain/status'
import type { InventoryBatch, ExpirySeverity, ExpiryStatus } from '../domain/types'

interface BatchRow {
  id: string
  qty_on_hand: number
  expires_at: string | null
  inventory_locations?: { id: string; name: string } | { id: string; name: string }[] | null
  supplier_items?: { name: string } | { name: string }[] | null
}

interface AlertRow {
  id: string
  batch_id: string
  severity: ExpirySeverity
  status: 'open' | 'dismissed'
}

interface RuleRow {
  threshold_days: number
  severity: ExpirySeverity
}

interface LocationRow {
  id: string
  name: string
}

const resolveName = (value?: { name: string } | { name: string }[] | null) =>
  Array.isArray(value) ? value[0]?.name ?? '' : value?.name ?? ''

export async function listInventoryBatches(): Promise<InventoryBatch[]> {
  try {
    await supabaseClient.rpc('generate_expiry_alerts')
  } catch {
    // Ignore RPC failures when the role cannot generate alerts.
  }

  const { data: batches, error } = await supabaseClient
    .from('stock_batches')
    .select('id, qty_on_hand, expires_at, inventory_locations(id, name), supplier_items(name)')

  if (error) throw new Error(error.message)

  const batchRows = (batches as unknown as BatchRow[]) ?? []
  const batchIds = batchRows.map((row) => row.id)

  const { data: rules, error: rulesError } = await supabaseClient
    .from('expiry_rules')
    .select('threshold_days, severity')
    .eq('is_active', true)

  if (rulesError) throw new Error(rulesError.message)

  const activeRules = (rules as unknown as RuleRow[]) ?? []

  const alertsByBatch = new Map<string, AlertRow[]>()

  if (batchIds.length > 0) {
    const { data: alerts, error: alertError } = await supabaseClient
      .from('expiry_alerts')
      .select('id, batch_id, severity, status')
      .in('batch_id', batchIds)

    if (alertError) throw new Error(alertError.message)

    ;((alerts as unknown as AlertRow[]) ?? []).forEach((alert) => {
      const entry = alertsByBatch.get(alert.batch_id) ?? []
      entry.push(alert)
      alertsByBatch.set(alert.batch_id, entry)
    })
  }

  return batchRows
    .map((row) => {
      const alerts = alertsByBatch.get(row.id) ?? []
      const location = Array.isArray(row.inventory_locations)
        ? row.inventory_locations[0]
        : row.inventory_locations
      const alertStatus = alerts.length > 0 ? getExpiryStatus(alerts) : getStatusFromRules(row.expires_at, activeRules)

      return {
        id: row.id,
        locationId: location?.id ?? '',
        itemName: resolveName(row.supplier_items),
        locationName: location?.name ?? '',
        qtyOnHand: row.qty_on_hand,
        expiresAt: row.expires_at,
        status: alertStatus
      }
    })
    .sort((a, b) => {
      if (!a.expiresAt && !b.expiresAt) return 0
      if (!a.expiresAt) return 1
      if (!b.expiresAt) return -1
      return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
    })
}

export async function listInventoryLocations(): Promise<LocationRow[]> {
  const { data, error } = await supabaseClient.from('inventory_locations').select('id, name').order('name')
  if (error) throw new Error(error.message)
  return (data as unknown as LocationRow[]) ?? []
}

export async function dismissAlertsForBatch(batchId: string): Promise<void> {
  const { error } = await supabaseClient
    .from('expiry_alerts')
    .update({ status: 'dismissed' })
    .eq('batch_id', batchId)
    .eq('status', 'open')
  if (error) throw new Error(error.message)
}

function getStatusFromRules(expiresAt: string | null, rules: RuleRow[]): ExpiryStatus {
  if (!expiresAt || rules.length === 0) return 'ok'
  const target = new Date(expiresAt).getTime()
  if (Number.isNaN(target)) return 'ok'

  const now = Date.now()
  let status: ExpiryStatus = 'ok'

  for (const rule of rules) {
    const threshold = now + rule.threshold_days * 24 * 60 * 60 * 1000
    if (target <= threshold) {
      if (rule.severity === 'critical') return 'critical'
      status = 'warning'
    }
  }

  return status
}
