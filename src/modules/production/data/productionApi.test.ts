import { describe, expect, it, vi } from 'vitest'
import { listProductionTasks } from './productionApi'

const mocks = vi.hoisted(() => {
  const orderMock = vi.fn()
  const selectMock = vi.fn(() => ({ order: () => ({ order: orderMock }) }))
  const fromMock = vi.fn(() => ({ select: selectMock }))
  return { orderMock, selectMock, fromMock }
})

vi.mock('@/lib/supabase/client', () => ({
  supabaseClient: { from: mocks.fromMock }
}))

describe('listProductionTasks', () => {
  it('maps tasks', async () => {
    mocks.orderMock.mockResolvedValue({
      data: [
        { id: 't1', title: 'Task', status: 'draft', station: 'Prep', priority: 1 },
        { id: 't2', title: 'Task2', status: 'done', station: null, priority: null }
      ],
      error: null
    })

    const tasks = await listProductionTasks()

    expect(mocks.fromMock).toHaveBeenCalledWith('production_tasks')
    expect(tasks).toHaveLength(2)
    expect(tasks[0].title).toBe('Task')
    expect(tasks[1].status).toBe('done')
  })
})
