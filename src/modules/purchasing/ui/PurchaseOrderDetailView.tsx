'use client'

import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AppShell } from '@/modules/shared/ui/AppShell'
import { Banner, ModalConfirm } from '@/modules/shared/ui/SkeletonGrid'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { PurchaseStatus } from '../domain/types'
import { canTransition, nextStatusOptions } from '../domain/status'
import { receivePurchaseOrder, updatePurchaseOrderStatus } from '../data/purchasingApi'
import { usePurchaseOrderDetail } from '../hooks/usePurchasing'

const statusLabels: Record<PurchaseStatus, string> = {
  draft: 'Borrador',
  approved: 'Aprobado',
  ordered: 'Ordenado',
  received: 'Recibido'
}

export function PurchaseOrderDetailView({ orderId }: { orderId: string }) {
  const { data, isLoading, error } = usePurchaseOrderDetail(orderId)
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirmStatus, setConfirmStatus] = useState<PurchaseStatus | null>(null)

  const availableTransitions = useMemo(
    () => (data ? nextStatusOptions(data.status) : []),
    [data]
  )

  const handleConfirm = async () => {
    if (!data || !confirmStatus) return
    setActionError(null)
    try {
      if (confirmStatus === 'received') {
        await receivePurchaseOrder(data.id)
      } else if (canTransition(data.status, confirmStatus)) {
        await updatePurchaseOrderStatus(data.id, confirmStatus)
      }
      setConfirmStatus(null)
      queryClient.invalidateQueries({ queryKey: ['purchase-order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No se pudo cambiar el estado')
    }
  }

  return (
    <AppShell title="Detalle pedido" description="Lineas y estado del pedido">
      <PageHeader
        title={`Pedido ${data?.supplierName ?? ''}`}
        description={data ? `Estado: ${statusLabels[data.status]}` : ''}
        actions={
          <div className="flex flex-wrap gap-2">
            {availableTransitions.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setConfirmStatus(status)}
                className="rounded-full border border-amber-500/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200"
              >
                Marcar {statusLabels[status]}
              </button>
            ))}
          </div>
        }
      />

      {error && (
        <div className="mb-6">
          <Banner message={error.message} type="error" />
        </div>
      )}

      {actionError && (
        <div className="mb-6">
          <Banner message={actionError} type="error" />
        </div>
      )}

      {isLoading ? (
        <Banner message="Cargando pedido..." />
      ) : data ? (
        <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6">
          <div className="mb-4 flex flex-wrap gap-4 text-sm text-slate-300">
            <span>Proveedor: {data.supplierName ?? 'Sin proveedor'}</span>
            <span>Hotel: {data.hotelName ?? 'Sin hotel'}</span>
            <span>
              Total: {data.totalEstimated ? `€${data.totalEstimated.toFixed(2)}` : '—'}
            </span>
          </div>
          {data.lines.length === 0 ? (
            <p className="text-sm text-slate-400">No hay lineas registradas.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.3em] text-slate-500">
                <tr>
                  <th className="py-2">Item</th>
                  <th className="py-2">Cantidad</th>
                  <th className="py-2">Precio</th>
                  <th className="py-2">Regla</th>
                </tr>
              </thead>
              <tbody>
                {data.lines.map((line) => (
                  <tr key={line.id} className="border-t border-slate-800/60 text-slate-200">
                    <td className="py-2 font-semibold text-white">
                      {line.supplierItemName ?? line.supplierItemId}
                    </td>
                    <td className="py-2">{line.requestedQty}</td>
                    <td className="py-2">
                      {line.unitPrice !== null && line.unitPrice !== undefined ? `€${line.unitPrice}` : '—'}
                    </td>
                    <td className="py-2">{line.roundingRule ?? 'none'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <Banner message="Pedido no encontrado." type="error" />
      )}

      <ModalConfirm
        open={Boolean(confirmStatus)}
        title="Confirmar cambio de estado"
        description={confirmStatus ? `Se marcara el pedido como ${statusLabels[confirmStatus]}.` : ''}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmStatus(null)}
      />
    </AppShell>
  )
}
