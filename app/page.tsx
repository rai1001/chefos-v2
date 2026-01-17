import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-slate-100">
      <p className="text-sm uppercase tracking-[0.3em] text-slate-400">ChefOS · Sprint 00</p>
      <h1 className="text-4xl font-semibold text-white">ChefOS reconstruido</h1>
      <p className="max-w-xl text-center text-base text-slate-300">
        Base lista para siguiente sprint: Supabase local, RLS y UI placeholder para dashboard.
        Navega al login y dashboard para validar la navegabilidad mínima.
      </p>
      <div className="flex gap-3">
        <Link
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-amber-400"
          href="/login"
        >
          Ir a login
        </Link>
        <Link
          className="rounded-md border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
          href="/dashboard"
        >
          Ver dashboard
        </Link>
      </div>
    </main>
  )
}
