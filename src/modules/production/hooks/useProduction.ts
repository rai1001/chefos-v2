'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listProductionTasks, updateProductionTask } from '../data/productionApi'
import type { ProductionTaskStatus } from '../domain/types'

export function useProductionTasks() {
  return useQuery({
    queryKey: ['production-tasks'],
    queryFn: listProductionTasks,
    staleTime: 10_000,
    retry: 1
  })
}

export function useUpdateProductionTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: ProductionTaskStatus }) =>
      updateProductionTask(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['production-tasks'] })
    }
  })
}
