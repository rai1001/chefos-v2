'use client'

import { useMemo, useState } from 'react'
import { AppShell } from '@/modules/shared/ui/AppShell'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { Banner, SkeletonGrid } from '@/modules/shared/ui/SkeletonGrid'
import { useCreateShift, useCreateTimeOff, useShifts, useShortages, useTimeOff } from '../hooks/useStaff'

function formatDateTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('es-ES')
}

export function StaffView() {
  const { data: shifts, isLoading: loadingShifts, error: shiftsError } = useShifts()
  const { data: timeOff, isLoading: loadingTimeOff, error: timeOffError } = useTimeOff()
  const { data: shortages } = useShortages()
  const createShift = useCreateShift()
  const createTimeOff = useCreateTimeOff()

  const shortagesBadge = useMemo(() => {
    const hasShortage = (shortages ?? []).some((item) => item.shortage > 0)
    return hasShortage ? 'Hay shortages esta semana' : 'Sin shortages detectados'
  }, [shortages])

  return (
    <AppShell title="Staff" description="Turnos y vacaciones">
      <PageHeader title="Staff" description="Planificacion semanal" />

      <div className="mb-4 rounded-3xl border border-slate-800/70 bg-slate-950/50 p-4 text-sm text-slate-200">
        {shortagesBadge}
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <form
          className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6"
          onSubmit={(event) => {
            event.preventDefault()
            const form = event.currentTarget
            const startsAt = (form.elements.namedItem('startsAt') as HTMLInputElement).value
            const endsAt = (form.elements.namedItem('endsAt') as HTMLInputElement).value
            const role = (form.elements.namedItem('role') as HTMLInputElement).value
            createShift.mutate({ startsAt, endsAt, role })
            form.reset()
          }}
        >
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-500">Nuevo turno</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Inicio
              <input name="startsAt" type="datetime-local" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white" required />
            </label>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Fin
              <input name="endsAt" type="datetime-local" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white" required />
            </label>
          </div>
          <label className="mt-3 block text-xs uppercase tracking-[0.2em] text-slate-500">
            Rol
            <input name="role" type="text" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white" placeholder="Chef / Kitchen" />
          </label>
          <button type="submit" className="mt-4 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950">
            Guardar turno
          </button>
        </form>

        <form
          className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6"
          onSubmit={(event) => {
            event.preventDefault()
            const form = event.currentTarget
            const startsAt = (form.elements.namedItem('startsAt') as HTMLInputElement).value
            const endsAt = (form.elements.namedItem('endsAt') as HTMLInputElement).value
            const type = (form.elements.namedItem('type') as HTMLSelectElement).value as 'vacation' | 'sick' | 'other'
            createTimeOff.mutate({ startsAt, endsAt, type })
            form.reset()
          }}
        >
          <p className="mb-2 text-xs uppercase tracking-[0.3em] text-slate-500">Tiempo libre</p>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Inicio
              <input name="startsAt" type="datetime-local" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white" required />
            </label>
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Fin
              <input name="endsAt" type="datetime-local" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white" required />
            </label>
          </div>
          <label className="mt-3 block text-xs uppercase tracking-[0.2em] text-slate-500">
            Tipo
            <select name="type" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white">
              <option value="vacation">Vacaciones</option>
              <option value="sick">Baja</option>
              <option value="other">Otro</option>
            </select>
          </label>
          <button type="submit" className="mt-4 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950">
            Guardar tiempo libre
          </button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">Turnos</h2>
            <span className="text-xs text-slate-400">{shifts?.length ?? 0} registros</span>
          </div>
          {shiftsError && <Banner message={shiftsError.message} type="error" />}
          {loadingShifts ? (
            <SkeletonGrid />
          ) : (shifts?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-400">No hay turnos.</p>
          ) : (
            <ul className="space-y-2 text-sm text-slate-200">
              {shifts!.map((shift) => (
                <li key={shift.id} className="rounded-xl border border-slate-800/60 px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white">{shift.role ?? 'Turno'}</span>
                    <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] uppercase tracking-[0.3em] text-slate-200">
                      {shift.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatDateTime(shift.startsAt)} - {formatDateTime(shift.endsAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">Tiempo libre</h2>
            <span className="text-xs text-slate-400">{timeOff?.length ?? 0} registros</span>
          </div>
          {timeOffError && <Banner message={timeOffError.message} type="error" />}
          {loadingTimeOff ? (
            <SkeletonGrid />
          ) : (timeOff?.length ?? 0) === 0 ? (
            <p className="text-sm text-slate-400">No hay solicitudes.</p>
          ) : (
            <ul className="space-y-2 text-sm text-slate-200">
              {timeOff!.map((item) => (
                <li key={item.id} className="rounded-xl border border-slate-800/60 px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white">{item.type}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {formatDateTime(item.startsAt)} - {formatDateTime(item.endsAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  )
}
