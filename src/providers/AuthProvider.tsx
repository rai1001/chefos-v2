'use client'

import { Session, User } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode
} from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { deleteCookieValue, setCookieValue } from '@/lib/helpers/cookies'

interface AuthContextValue {
  session: Session | null
  user: User | null
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  const COOKIE_OPTS = useMemo(
    () => ({
      path: '/',
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production'
    }),
    []
  )

  const syncAuthCookies = useCallback(
    (nextSession: Session | null) => {
      if (typeof document === 'undefined') return

      if (nextSession) {
        setCookieValue('sb-access-token', nextSession.access_token, COOKIE_OPTS)
        setCookieValue('sb-refresh-token', nextSession.refresh_token ?? '', COOKIE_OPTS)
        setCookieValue('sb-token-type', nextSession.token_type ?? 'bearer', COOKIE_OPTS)
      } else {
        deleteCookieValue('sb-access-token', COOKIE_OPTS)
        deleteCookieValue('sb-refresh-token', COOKIE_OPTS)
        deleteCookieValue('sb-token-type', COOKIE_OPTS)
      }
    },
    [COOKIE_OPTS]
  )

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => {
      setSession(data.session)
      syncAuthCookies(data.session ?? null)
    })
    const { data } = supabaseClient.auth.onAuthStateChange((_, newSession) => {
      setSession(newSession)
      syncAuthCookies(newSession)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [syncAuthCookies])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      signIn: async (email: string, password: string) => {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password })
        syncAuthCookies(data.session ?? null)
        return { error }
      },
      signUp: async (email: string, password: string) => {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined
          }
        })
        if (data.session) {
          syncAuthCookies(data.session)
        }
        return { error }
      },
      signInWithOtp: async (email: string) => {
        const { error } = await supabaseClient.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined
          }
        })
        return { error }
      },
      signOut: async () => {
        await supabaseClient.auth.signOut()
        syncAuthCookies(null)
        setSession(null)
      }
    }),
    [session, syncAuthCookies]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
