'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ReactNode, useMemo } from 'react'
import { CommandPalette } from './CommandPalette'
import { PageHeader } from './PageHeader'
import { Banner } from './SkeletonGrid'
import { useActiveOrg } from '@/modules/orgs/hooks/useActiveOrg'
import { useAuth } from '@/providers'

const NAV_ROUTES = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Eventos', href: '/events' },
  { label: 'Pedidos', href: '/orders' },
  { label: 'Inventario', href: '/inventory' },
  { label: 'Staff', href: '/staff' },
  { label: 'Settings', href: '/settings' }
]

interface AppShellProps {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function AppShell({ title, description, actions, children }: AppShellProps) {
  const { session, signOut } = useAuth()
  const router = useRouter()
  const email = useMemo(() => session?.user?.email ?? 'Invitado', [session])
  const {
    orgName,
    hotels,
    activeHotelId,
    setActiveHotelId,
    loading: fetchingHotels,
    error: orgError
  } = useActiveOrg()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-950/90 text-slate-100">
      <aside className="w-64 border-r border-slate-900/70 bg-slate-950/50 px-4 py-8">
        <div className="mb-10 text-center text-xl font-semibold text-white">ChefOS</div>
        <nav className="space-y-2 text-sm">
          {NAV_ROUTES.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="block rounded-lg px-3 py-2 transition hover:bg-slate-900 hover:text-white"
            >
              {route.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col gap-0 bg-slate-950/40 p-6">
        <header className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-900/60 bg-slate-900/70 px-6 py-4 shadow-lg shadow-black/20 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Org activa</p>
            <p className="text-sm text-slate-300">{email}</p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Hotel</div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              {fetchingHotels ? (
                <span>Cargando hoteles...</span>
              ) : orgError ? (
                <span className="text-red-400">{orgError}</span>
              ) : (
                <select
                  value={activeHotelId ?? ''}
                  onChange={(event) => {
                    const value = event.target.value
                    if (value) {
                      setActiveHotelId(value)
                    }
                  }}
                  className="rounded-full border border-slate-800 bg-slate-950/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white outline-none transition hover:border-slate-700"
                >
                  {hotels.length > 0 ? (
                    hotels.map((hotel) => (
                      <option className="bg-slate-950 text-sm text-white" key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </option>
                    ))
                  ) : (
                    <option value="">{orgName ?? 'Sin hoteles'}</option>
                  )}
                </select>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CommandPalette />
            <button
              type="button"
              className="rounded-full border border-slate-700/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-slate-500"
              onClick={handleSignOut}
            >
              Cerrar sesion
            </button>
          </div>
        </header>
        {title && (
          <div className="mb-4">
            <Banner message="Navegacion protegida por Supabase Auth" />
          </div>
        )}
        {title && <PageHeader title={title} description={description} actions={actions} />}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
