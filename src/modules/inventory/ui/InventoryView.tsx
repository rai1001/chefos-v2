'use client'

import { useMemo, useState } from 'react'
import { AppShell } from '@/modules/shared/ui/AppShell'
import { Banner, SkeletonGrid } from '@/modules/shared/ui/SkeletonGrid'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { useDismissAlert, useInventoryBatches, useInventoryLocations } from '../hooks/useInventory'
import type { ExpiryStatus, InventoryBatch } from '../domain/types'

const statusLabels: Record<ExpiryStatus, string> = {
  ok: 'OK',
  warning: 'Pronto',
  critical: 'Critico'
}

const statusClasses: Record<ExpiryStatus, string> = {
  ok: 'border-emerald-500/60 text-emerald-200',
  warning: 'border-amber-500/60 text-amber-200',
  critical: 'border-red-500/60 text-red-200'
}

function formatDate(value: string | null) {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Sin fecha'
  return date.toLocaleDateString('es-ES')
}

export function InventoryView() {
  const [locationId, setLocationId] = useState('')
  const [status, setStatus] = useState<ExpiryStatus | 'all'>('all')
  const { data: batches, isLoading, error } = useInventoryBatches()
  const { data: locations } = useInventoryLocations()
  const dismissAlert = useDismissAlert()

  const filtered = useMemo(() => {
    if (!batches) return []
    let result = batches
    if (status !== 'all') {
      result = result.filter((batch) => batch.status === status)
    }
    if (locationId) {
      result = result.filter((batch) => batch.locationId === locationId)
    }
    return result
  }, [batches, locationId, status])

  return (
    <AppShell title="Inventario" description="Control de lotes y caducidad">
      <PageHeader title="Inventario" description="Lotes activos y alertas de caducidad" />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Ubicacion
          <select
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
            value={locationId}
            onChange={(event) => setLocationId(event.target.value)}
          >
            <option value="">Todas</option>
            {(locations ?? []).map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Estado
          <select
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
            value={status}
            onChange={(event) => setStatus(event.target.value as ExpiryStatus | 'all')}
          >
            <option value="all">Todos</option>
            <option value="ok">OK</option>
            <option value="warning">Pronto</option>
            <option value="critical">Critico</option>
          </select>
        </label>
      </div>

      {error && (
        <div className="mb-6">
          <Banner message={error.message} type="error" />
        </div>
      )}

      {isLoading ? (
        <SkeletonGrid />
      ) : filtered.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 text-xs uppercase tracking-[0.3em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Ubicacion</th>
                <th className="px-4 py-3">On hand</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Accion</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((batch) => (
                <tr key={batch.id} className="border-t border-slate-800/60 text-slate-200">
                  <td className="px-4 py-3 font-semibold text-white">{batch.itemName}</td>
                  <td className="px-4 py-3 text-slate-300">{batch.locationName}</td>
                  <td className="px-4 py-3 text-slate-300">{batch.qtyOnHand}</td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(batch.expiresAt)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.3em] ${
                        statusClasses[batch.status]
                      }`}
                    >
                      {statusLabels[batch.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="rounded-full border border-slate-700/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 disabled:opacity-40"
                      disabled={batch.status === 'ok' || dismissAlert.isPending}
                      onClick={() => dismissAlert.mutate(batch.id)}
                    >
                      Descartar alerta
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-400">No hay lotes disponibles.</p>
      )}
    </AppShell>
  )
}
