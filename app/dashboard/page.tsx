import { AppShell } from '@/modules/shared/ui/AppShell'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { SkeletonGrid } from '@/modules/shared/ui/SkeletonGrid'

const cards = [
  { label: 'Eventos hoy', value: '0' },
  { label: 'Pedidos abiertos', value: '0' },
  { label: 'Alertas', value: '0' }
]

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" description="Resumen rápido de eventos, pedidos y alertas">
      <PageHeader
        title="Panel ejecutivo"
        description="Información placeholder para el sprint actual"
        actions={<span className="text-xs uppercase tracking-[0.3em] text-slate-400">Sprint 01</span>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.label}
            className="rounded-2xl border border-slate-800/70 bg-gradient-to-br from-slate-900/70 to-slate-900/90 p-4 text-white"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-bold">{card.value}</p>
            <p className="mt-2 text-xs text-slate-400">Datos habilitados en Sprint 02.</p>
          </article>
        ))}
      </div>
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white">Indicadores adicionales</h2>
        <SkeletonGrid />
      </div>
    </AppShell>
  )
}
