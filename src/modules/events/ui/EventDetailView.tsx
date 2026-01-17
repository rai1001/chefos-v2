'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '@/modules/shared/ui/AppShell'
import { Banner, ModalConfirm } from '@/modules/shared/ui/SkeletonGrid'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { useEventDetail } from '../hooks/useEvents'
import { updateEventStatus } from '../data/eventsApi'

const formatDate = (value: string) =>
  new Date(value).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })

export function EventDetailView({ eventId }: { eventId: string }) {
  const router = useRouter()
  const { data, isLoading, error } = useEventDetail(eventId)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleCancel = async () => {
    setActionError(null)
    try {
      await updateEventStatus(eventId, 'cancelled')
      setConfirmOpen(false)
      router.refresh()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No se pudo cancelar el evento')
    }
  }

  return (
    <AppShell title="Detalle evento" description="Servicios y reservas asociadas">
      <PageHeader
        title={data?.event.title ?? 'Evento'}
        description={data ? `${formatDate(data.event.startsAt)} - ${formatDate(data.event.endsAt)}` : ''}
        actions={
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded-full border border-red-500/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-red-200"
          >
            Cancelar
          </button>
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
        <Banner message="Cargando evento..." />
      ) : data ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6">
            <h3 className="text-base font-semibold text-white">Servicios</h3>
            {data.services.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No hay servicios registrados.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                {data.services.map((service) => (
                  <li key={service.id} className="rounded-2xl border border-slate-800/70 px-4 py-3">
                    <p className="font-semibold text-white">{service.serviceType}</p>
                    <p className="text-xs text-slate-400">Formato: {service.format}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6">
            <h3 className="text-base font-semibold text-white">Reservas de espacio</h3>
            {data.bookings.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No hay reservas registradas.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                {data.bookings.map((booking) => (
                  <li key={booking.id} className="rounded-2xl border border-slate-800/70 px-4 py-3">
                    <p className="font-semibold text-white">{booking.spaceName ?? booking.spaceId}</p>
                    <p className="text-xs text-slate-400">
                      {formatDate(booking.startsAt)} - {formatDate(booking.endsAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <Banner message="No se encontro el evento." type="error" />
      )}

      <ModalConfirm
        open={confirmOpen}
        title="Cancelar evento"
        description="Esta accion marca el evento como cancelado."
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </AppShell>
  )
}
