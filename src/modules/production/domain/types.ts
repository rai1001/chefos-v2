export type ProductionTaskStatus = 'draft' | 'in_progress' | 'done'

export interface ProductionTask {
  id: string
  title: string
  status: ProductionTaskStatus
  station?: string | null
  priority?: number | null
}
