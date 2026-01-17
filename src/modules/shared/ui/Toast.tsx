import { useEffect } from 'react'

export function Toast({
  message,
  type = 'info',
  onDismiss,
  durationMs = 4000
}: {
  message: string
  type?: 'info' | 'error'
  onDismiss: () => void
  durationMs?: number
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs)
    return () => clearTimeout(timer)
  }, [durationMs, onDismiss])

  const colors =
    type === 'error'
      ? 'border-red-500/40 bg-red-500/10 text-red-100'
      : 'border-slate-700/60 bg-slate-900/80 text-slate-100'

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm shadow-lg shadow-black/30 ${colors}`}>
      {message}
    </div>
  )
}
