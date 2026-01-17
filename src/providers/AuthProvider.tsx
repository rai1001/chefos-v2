'use client'

import { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { supabaseClient } from '@/lib/supabase/client'

interface AuthContextValue {
  session: Session | null
  user: User | null
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabaseClient.auth.onAuthStateChange((_, newSession) => {
      setSession(newSession)
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      signIn: async (email: string, password: string) => {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password })
        return { error }
      },
      signOut: async () => {
        await supabaseClient.auth.signOut()
        setSession(null)
      }
    }),
    [session]
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
