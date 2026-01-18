'use client'

import Link from 'next/link'
import { AppShell } from '@/modules/shared/ui/AppShell'
import { Banner, SkeletonGrid } from '@/modules/shared/ui/SkeletonGrid'
import { EventTable } from '@/modules/shared/ui/EventTable'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { useEventsList } from '../hooks/useEvents'

export function EventListView() {
  const { data, isLoading, error } = useEventsList()

  return (
    <AppShell title="Eventos" description="Calendario y filtros por hotel">
      <PageHeader
        title="Eventos"
        description="Gestiona eventos, espacios y servicios"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/events/new"
              className="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950"
            >
              Crear evento
            </Link>
            <Link
              href="/staff"
              className="rounded-full border border-slate-700/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200"
            >
              Ir a staff
            </Link>
            <Link
              href="/dashboard#production"
              className="rounded-full border border-slate-700/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200"
            >
              Ver produccion
            </Link>
          </div>
        }
      />

      {error && (
        <div className="mb-6">
          <Banner message={error.message} type="error" />
        </div>
      )}

      {isLoading ? <SkeletonGrid /> : <EventTable rows={data ?? []} />}
    </AppShell>
  )
}
