import Link from 'next/link'

interface EventTableRow {
  id: string
  title: string
  startsAt: string
  status: string
  hotelName?: string | null
}

const formatDate = (value: string) =>
  new Date(value).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })

export function EventTable({ rows }: { rows: EventTableRow[] }) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-400">No hay eventos cargados.</p>
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/50">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900/60 text-xs uppercase tracking-[0.3em] text-slate-500">
          <tr>
            <th className="px-4 py-3">Evento</th>
            <th className="px-4 py-3">Fecha</th>
            <th className="px-4 py-3">Hotel</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-800/60 text-slate-200">
              <td className="px-4 py-3 font-semibold text-white">{row.title}</td>
              <td className="px-4 py-3 text-slate-300">{formatDate(row.startsAt)}</td>
              <td className="px-4 py-3 text-slate-300">{row.hotelName ?? 'Sin hotel'}</td>
              <td className="px-4 py-3">
                <span className="rounded-full border border-slate-700/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-300">
                  {row.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/events/${row.id}`}
                  className="rounded-full border border-amber-500/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200 transition hover:border-amber-400"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
