import './globals.css'
import { Providers } from '@/providers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ChefOS · Cimientos',
  description: 'Base reconstruida de ChefOS con Next.js + Supabase'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
