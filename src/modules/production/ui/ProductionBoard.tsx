'use client'

import { useState } from 'react'
import { AppShell } from '@/modules/shared/ui/AppShell'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { Banner, SkeletonGrid } from '@/modules/shared/ui/SkeletonGrid'

interface Task {
  id: string
  title: string
  status: 'draft' | 'in_progress' | 'done'
  station?: string | null
}

const SAMPLE_TASKS: Task[] = [
  { id: 't1', title: 'Picar verduras', status: 'draft', station: 'Prep' },
  { id: 't2', title: 'Salsa base', status: 'in_progress', station: 'Cocina' },
  { id: 't3', title: 'Montar postre', status: 'done', station: 'Pastry' }
]

export function ProductionBoard() {
  const [tasks, setTasks] = useState<Task[]>(SAMPLE_TASKS)
  const [loading] = useState(false)

  const moveStatus = (taskId: string, status: Task['status']) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)))
  }

  return (
    <AppShell title="Produccion" description="Planes y tareas">
      <PageHeader title="Produccion" description="Tablero por servicio" />
      <div className="grid gap-4 md:grid-cols-3">
        {loading && (
          <div className="col-span-3">
            <SkeletonGrid />
          </div>
        )}
        {(['draft', 'in_progress', 'done'] as Task['status'][]).map((column) => (
          <section key={column} className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-200">{column}</h2>
              <span className="text-xs text-slate-400">
                {tasks.filter((t) => t.status === column).length} items
              </span>
            </div>
            <div className="space-y-2">
              {tasks
                .filter((t) => t.status === column)
                .map((task) => (
                  <div key={task.id} className="rounded-xl border border-slate-800/60 px-3 py-2 text-sm text-slate-200">
                    <div className="font-semibold text-white">{task.title}</div>
                    <div className="text-xs text-slate-400">{task.station ?? 'General'}</div>
                    <div className="mt-2 flex gap-2">
                      {column !== 'draft' && (
                        <button
                          type="button"
                          className="rounded-full border border-slate-700 px-2 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-200"
                          onClick={() => moveStatus(task.id, 'draft')}
                        >
                          Draft
                        </button>
                      )}
                      {column !== 'in_progress' && (
                        <button
                          type="button"
                          className="rounded-full border border-slate-700 px-2 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-200"
                          onClick={() => moveStatus(task.id, 'in_progress')}
                        >
                          In progress
                        </button>
                      )}
                      {column !== 'done' && (
                        <button
                          type="button"
                          className="rounded-full border border-emerald-500/60 px-2 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-200"
                          onClick={() => moveStatus(task.id, 'done')}
                        >
                          Done
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </section>
        ))}
      </div>
      <div className="mt-4">
        <Banner message="Placeholder: conectar con production_tasks y update_production_task_status RPC." type="info" />
      </div>
    </AppShell>
  )
}
