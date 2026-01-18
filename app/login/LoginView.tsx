'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useMemo, useState } from 'react'
import { Banner } from '@/modules/shared/ui/SkeletonGrid'
import { useAuth } from '@/providers/AuthProvider'

type ViewMode = 'login' | 'signup' | 'magic_link'

export function LoginView() {
  const [view, setView] = useState<ViewMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signIn, signUp, signInWithOtp } = useAuth()
  const searchParams = useSearchParams()
  const loginErrorReason = searchParams.get('error')
  const loginErrorMessage = useMemo(() => {
    if (!loginErrorReason) return null
    if (loginErrorReason === 'no-membership') {
      return 'Tu cuenta no tiene una membresia activa. Contacta a un admin para obtener acceso.'
    }
    return 'Tu sesion expiro o es invalida. Inicia sesion nuevamente.'
  }, [loginErrorReason])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    let result
    if (view === 'login') {
      result = await signIn(email, password)
    } else if (view === 'signup') {
      result = await signUp(email, password)
    } else {
      result = await signInWithOtp(email)
    }

    setLoading(false)

    if (result.error) {
      setError(result.error.message)
      return
    }

    if (view === 'login') {
      // Force a full page reload to ensure cookies are sent to the server
      window.location.href = '/dashboard'
    } else if (view === 'signup') {
      setSuccessMessage('Cuenta creada. Revisa tu correo para confirmar.')
    } else {
      setSuccessMessage('Magic link enviado. Revisa tu correo.')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8 shadow-2xl shadow-slate-900/50 backdrop-blur">
        <h1 className="text-3xl font-semibold text-white">Bienvenido a ChefOS</h1>
        <p className="mt-2 text-sm text-slate-400">
          Inicia sesion con Supabase Auth para acceder al AppShell.
        </p>

        {/* Tabs */}
        <div className="mt-6 flex border-b border-slate-700/50">
          <button
            onClick={() => { setView('login'); setError(''); setSuccessMessage('') }}
            className={`pb-2 text-xs uppercase tracking-widest px-4 transition ${view === 'login' ? 'border-b-2 border-amber-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setView('signup'); setError(''); setSuccessMessage('') }}
            className={`pb-2 text-xs uppercase tracking-widest px-4 transition ${view === 'signup' ? 'border-b-2 border-amber-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Registro
          </button>
          <button
            onClick={() => { setView('magic_link'); setError(''); setSuccessMessage('') }}
            className={`pb-2 text-xs uppercase tracking-widest px-4 transition ${view === 'magic_link' ? 'border-b-2 border-amber-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Magic Link
          </button>
        </div>

        {error && <div className="mt-4"><Banner message={error} type="error" /></div>}
        {successMessage && <div className="mt-4"><Banner message={successMessage} /></div>}
        {loginErrorMessage && !error && !successMessage && <div className="mt-4"><Banner message={loginErrorMessage} /></div>}

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

          {view !== 'magic_link' && (
            <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Contrasena
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                type="password"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 px-4 py-3 text-sm font-semibold uppercase tracking-widest text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : view === 'login' ? 'Iniciar sesion' : view === 'signup' ? 'Registrarse' : 'Enviar Link'}
          </button>
        </form>

        {view === 'login' && (
           <p className="mt-4 text-center text-xs text-slate-400">
             Credenciales de prueba: <span className="font-semibold text-white">admin@chefos.test / ChefOS@2026!</span>
           </p>
        )}
      </div>
      <Link className="mt-4 text-sm text-slate-400 hover:text-white" href="/">
        Volver al home
      </Link>
    </main>
  )
}
