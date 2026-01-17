'use client'

import Link from 'next/link'
import { AppShell } from '@/modules/shared/ui/AppShell'
import { Banner, SkeletonGrid } from '@/modules/shared/ui/SkeletonGrid'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { usePurchaseOrders } from '../hooks/usePurchasing'

const statusColors: Record<string, string> = {
  draft: 'border-slate-600 text-slate-300',
  approved: 'border-amber-500/60 text-amber-200',
  ordered: 'border-blue-500/60 text-blue-200',
  received: 'border-emerald-500/60 text-emerald-200'
}

export function PurchaseOrdersListView() {
  const { data, isLoading, error } = usePurchaseOrders()

  return (
    <AppShell title="Pedidos" description="Flujo de compras y recepciones">
      <PageHeader
        title="Pedidos"
        description="Controla pedidos por proveedor y estado"
        actions={
          <Link
            href="/orders/new"
            className="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950"
          >
            Crear pedido
          </Link>
        }
      />

      {error && (
        <div className="mb-6">
          <Banner message={error.message} type="error" />
        </div>
      )}

      {isLoading ? (
        <SkeletonGrid />
      ) : data && data.length > 0 ? (
        <div className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/50">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 text-xs uppercase tracking-[0.3em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Hotel</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map((order) => (
                <tr key={order.id} className="border-t border-slate-800/60 text-slate-200">
                  <td className="px-4 py-3 font-semibold text-white">{order.supplierName ?? 'Sin proveedor'}</td>
                  <td className="px-4 py-3 text-slate-300">{order.hotelName ?? 'Sin hotel'}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {order.totalEstimated ? `€${order.totalEstimated.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.3em] ${
                        statusColors[order.status] ?? 'border-slate-700 text-slate-300'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/orders/${order.id}`}
                      className="rounded-full border border-amber-500/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-400">No hay pedidos registrados.</p>
      )}
    </AppShell>
  )
}
