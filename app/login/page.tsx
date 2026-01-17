'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { Banner } from '@/modules/shared/ui/SkeletonGrid'
import { useAuth } from '@/providers/AuthProvider'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signIn } = useAuth()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8 shadow-2xl shadow-slate-900/50 backdrop-blur">
        <h1 className="text-3xl font-semibold text-white">Bienvenido a ChefOS</h1>
        <p className="mt-2 text-sm text-slate-400">Inicia sesión con Supabase Auth para acceder al AppShell.</p>
        {error && <Banner message={error} type="error" />}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Correo
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              type="email"
              placeholder="chef@empresa.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Contraseña
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-500">
          Login real implementado con Supabase Auth.
        </p>
        <div className="mt-6 flex justify-center text-sm">
          <Link
            className="rounded-md border border-slate-700/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 transition hover:border-slate-500 hover:text-white"
            href="/dashboard"
          >
            Ver dashboard
          </Link>
        </div>
      </div>
      <Link className="mt-4 text-sm text-slate-400 hover:text-white" href="/">
        Volver al home
      </Link>
    </main>
  )
}
