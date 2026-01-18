'use client'

import { useState } from 'react'
import { Banner } from '@/modules/shared/ui/SkeletonGrid'

interface MenuTemplate {
  id: string
  name: string
  version: number
}

export function MenusSettingsView() {
  const [templates, setTemplates] = useState<MenuTemplate[]>([
    { id: 'tmpl-1', name: 'Menu Degustacion', version: 1 },
    { id: 'tmpl-2', name: 'Coffee Break', version: 2 }
  ])
  const [name, setName] = useState('')

  return (
    <section className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Menus</p>
        <h2 className="text-lg font-semibold text-white">Templates y overrides</h2>
      </div>
      <div className="mb-4 flex flex-wrap gap-3">
        {templates.map((tmpl) => (
          <div key={tmpl.id} className="rounded-2xl border border-slate-800/70 px-4 py-3 text-sm text-slate-200">
            <div className="font-semibold text-white">{tmpl.name}</div>
            <div className="text-xs text-slate-400">v{tmpl.version}</div>
          </div>
        ))}
      </div>
      <form
        className="flex flex-col gap-3 md:flex-row md:items-center"
        onSubmit={(event) => {
          event.preventDefault()
          if (!name.trim()) return
          setTemplates((prev) => [
            ...prev,
            { id: `tmpl-${prev.length + 1}`, name: name.trim(), version: 1 }
          ])
          setName('')
        }}
      >
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white md:w-auto md:flex-1"
          placeholder="Nuevo template"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          type="submit"
          className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950"
        >
          Crear
        </button>
      </form>
      <div className="mt-4">
        <Banner message="Overrides pendientes: placeholder hasta conectar con eventos." type="info" />
      </div>
    </section>
  )
}
