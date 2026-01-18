import { supabaseClient } from '@/lib/supabase/client'
import type { ProductionTask, ProductionTaskStatus } from '../domain/types'

interface ProductionTaskRow {
  id: string
  title: string
  status: ProductionTaskStatus
  station?: string | null
  priority?: number | null
}

export async function listProductionTasks(): Promise<ProductionTask[]> {
  const { data, error } = await supabaseClient
    .from('production_tasks')
    .select('id, title, status, station, priority')
    .order('priority', { nullsFirst: false })
    .order('title')

  if (error) throw new Error(error.message)

  return ((data as unknown as ProductionTaskRow[]) ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    status: row.status,
    station: row.station ?? null,
    priority: row.priority ?? null
  }))
}

export async function updateProductionTask(taskId: string, status: ProductionTaskStatus): Promise<void> {
  const { error } = await supabaseClient.rpc('update_production_task_status', {
    p_task_id: taskId,
    p_status: status
  })
  if (error) throw new Error(error.message)
}
