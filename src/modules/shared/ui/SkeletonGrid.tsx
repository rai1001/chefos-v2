export function SkeletonGrid() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-32 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-4 shadow-inner shadow-black/50"
        />
      ))}
    </div>
  )
}

export function Banner({ message, type }: { message: string; type?: 'info' | 'error' }) {
  const colors =
    type === 'error'
      ? 'text-red-200 bg-red-500/10 border-red-500/20'
      : 'text-slate-100 bg-slate-800/70 border-slate-700'
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${colors}`}>
      {message}
    </div>
  )
}

export function ModalConfirm({
  open,
  title,
  description,
  onConfirm,
  onCancel
}: {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl shadow-black/80">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-300">{description}</p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950"
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
