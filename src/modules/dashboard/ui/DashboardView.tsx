'use client'

import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/modules/shared/ui/AppShell'
import { Banner, SkeletonGrid } from '@/modules/shared/ui/SkeletonGrid'
import { KPICard } from '@/modules/shared/ui/KPICard'
import { Toast } from '@/modules/shared/ui/Toast'
import { useDashboardData } from '../hooks/useDashboardData'

const formatDay = (value: string) =>
  new Date(value).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })

export function DashboardView() {
  const { data, isLoading, error } = useDashboardData()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    if (error) {
      setToastMessage('No se pudo cargar el dashboard. Verifica la sesion o los permisos.')
    }
  }, [error])

  const kpis = useMemo(() => data?.kpis ?? [], [data])
  const highlights = useMemo(() => data?.highlights ?? [], [data])
  const rollingGrid = useMemo(() => data?.rollingGrid ?? [], [data])

  return (
    <AppShell title="Dashboard" description="KPIs y actividad de la semana">
      {toastMessage && (
        <div className="fixed right-6 top-6 z-50">
          <Toast message={toastMessage} type="error" onDismiss={() => setToastMessage(null)} />
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Banner message={error.message} type="error" />
        </div>
      )}

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-white">KPIs de la semana</h2>
        {isLoading ? (
          <SkeletonGrid />
        ) : kpis.length === 0 ? (
          <p className="text-sm text-slate-400">No hay datos disponibles para mostrar.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {kpis.map((kpi) => (
              <KPICard key={kpi.label} label={kpi.label} value={kpi.value} hint={kpi.hint} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-10 grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6">
          <h3 className="text-base font-semibold text-white">Highlights proximos</h3>
          <p className="mt-1 text-sm text-slate-400">Eventos confirmados y en preparacion.</p>
          {isLoading ? (
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-16 rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/60"
                />
              ))}
            </div>
          ) : highlights.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">No hay eventos destacados en los proximos dias.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {highlights.map((item) => (
                <div
                  key={item.eventId}
                  className="rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-slate-400">
                        {formatDateTime(item.startsAt)} · {item.hotelName}
                      </p>
                    </div>
                    <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-amber-200">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6">
          <h3 className="text-base font-semibold text-white">Timeline semanal</h3>
          <p className="mt-1 text-sm text-slate-400">Vista rapida de carga por dia.</p>
          {isLoading ? (
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-10 rounded-2xl border border-dashed border-slate-800/80 bg-slate-900/60"
                />
              ))}
            </div>
          ) : rollingGrid.length === 0 ? (
            <p className="mt-6 text-sm text-slate-400">No hay eventos en el calendario activo.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {rollingGrid.map((day) => (
                <div key={day.day} className="flex items-center justify-between text-sm text-slate-200">
                  <span className="text-xs uppercase tracking-[0.3em] text-slate-400">{formatDay(day.day)}</span>
                  <span className="rounded-full border border-slate-700/60 px-3 py-1 text-xs font-semibold text-white">
                    {day.eventsCount} eventos
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  )
}
