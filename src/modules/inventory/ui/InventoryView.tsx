'use client'

import { useMemo, useState } from 'react'
import { AppShell } from '@/modules/shared/ui/AppShell'
import { Banner, SkeletonGrid } from '@/modules/shared/ui/SkeletonGrid'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { useActiveOrg } from '@/modules/orgs/hooks/useActiveOrg'
import {
  useAssignBarcode,
  useBarcodeLookup,
  useDismissAlert,
  useInventoryBatches,
  useInventoryLocations,
  useSupplierItemsForBarcode
} from '../hooks/useInventory'
import { isValidBarcode } from '../domain/barcode'
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
  const [barcodeValue, setBarcodeValue] = useState('')
  const [barcodeMessage, setBarcodeMessage] = useState<string | null>(null)
  const [barcodeNotFound, setBarcodeNotFound] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState('')
  const { data: batches, isLoading, error } = useInventoryBatches()
  const { data: locations } = useInventoryLocations()
  const dismissAlert = useDismissAlert()
  const barcodeLookup = useBarcodeLookup()
  const assignBarcode = useAssignBarcode()
  const { data: barcodeItems } = useSupplierItemsForBarcode()
  const { orgId } = useActiveOrg()

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

      <div className="mb-6 rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6">
        <div className="mb-4 text-xs uppercase tracking-[0.3em] text-slate-500">Barcode</div>
        <form
          className="grid gap-3 md:grid-cols-[2fr,1fr]"
          onSubmit={async (event) => {
            event.preventDefault()
            const trimmed = barcodeValue.trim()
            if (!trimmed) return
            if (!isValidBarcode(trimmed)) {
              setBarcodeMessage('Barcode invalido. Usa solo digitos (8-14).')
              setBarcodeNotFound(false)
              return
            }
            setBarcodeMessage(null)
            setBarcodeNotFound(false)
            setSelectedItemId('')

            try {
              const result = await barcodeLookup.mutateAsync(trimmed)
              if (result) {
                setBarcodeMessage(`Barcode asociado a ${result.supplierItemName}`)
                setBarcodeNotFound(false)
              } else {
                setBarcodeMessage('Barcode no registrado. Asignalo a un item existente.')
                setBarcodeNotFound(true)
              }
            } catch (error) {
              setBarcodeMessage(error instanceof Error ? error.message : 'No se pudo buscar el barcode')
            }
          }}
        >
          <input
            aria-label="Barcode"
            className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
            placeholder="Escanear o escribir barcode"
            value={barcodeValue}
            onChange={(event) => setBarcodeValue(event.target.value)}
          />
          <button
            type="submit"
            className="rounded-lg border border-amber-500/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200 disabled:opacity-40"
            disabled={barcodeLookup.isPending}
          >
            Buscar
          </button>
        </form>

        {barcodeMessage && <p className="mt-3 text-sm text-slate-300">{barcodeMessage}</p>}

        {barcodeNotFound && (
          <div className="mt-4 grid gap-3 md:grid-cols-[2fr,1fr]">
            <select
              aria-label="Asignar item"
              className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
              value={selectedItemId}
              onChange={(event) => setSelectedItemId(event.target.value)}
            >
              <option value="">Selecciona un item</option>
              {(barcodeItems ?? []).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950 disabled:opacity-40"
              disabled={!selectedItemId || assignBarcode.isPending}
              onClick={async () => {
                try {
                  await assignBarcode.mutateAsync({
                    orgId,
                    barcode: barcodeValue,
                    supplierItemId: selectedItemId
                  })
                  const itemName = (barcodeItems ?? []).find((item) => item.id === selectedItemId)?.name ?? 'item'
                  setBarcodeMessage(`Barcode asignado a ${itemName}`)
                  setBarcodeNotFound(false)
                } catch (error) {
                  setBarcodeMessage(error instanceof Error ? error.message : 'No se pudo asignar el barcode')
                }
              }}
            >
              Asignar
            </button>
          </div>
        )}
      </div>

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
