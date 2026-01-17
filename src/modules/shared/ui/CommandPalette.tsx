'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'

const ROUTES = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Eventos', href: '/events' },
  { label: 'Pedidos', href: '/orders' },
  { label: 'Inventario', href: '/inventory' },
  { label: 'Staff', href: '/staff' },
  { label: 'Settings', href: '/settings' }
]

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const navigate = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  const buttonLabel = useMemo(() => '⌘K', [])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full border border-slate-700/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-slate-500"
      >
        {buttonLabel}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-2xl border border-slate-800/70 bg-slate-900/80 p-3 shadow-lg shadow-black/60">
          {ROUTES.map((route) => (
            <button
              key={route.href}
              className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-800"
              onClick={() => navigate(route.href)}
            >
              {route.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
