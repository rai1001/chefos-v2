interface KPICardProps {
  label: string
  value: number | string
  hint?: string
}

export function KPICard({ label, value, hint }: KPICardProps) {
  return (
    <article className="rounded-2xl border border-slate-800/70 bg-gradient-to-br from-slate-900/70 to-slate-900/90 p-4 text-white shadow-lg shadow-black/20">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
    </article>
  )
}
