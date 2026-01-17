'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/providers'
import { dismissAlertsForBatch, listInventoryBatches, listInventoryLocations } from '../data/inventoryApi'

export function useInventoryBatches() {
  const { session } = useAuth()
  return useQuery({
    queryKey: ['inventory-batches', session?.user?.id],
    queryFn: listInventoryBatches,
    enabled: Boolean(session),
    staleTime: 10_000,
    retry: 1
  })
}

export function useInventoryLocations() {
  const { session } = useAuth()
  return useQuery({
    queryKey: ['inventory-locations', session?.user?.id],
    queryFn: listInventoryLocations,
    enabled: Boolean(session),
    staleTime: 30_000,
    retry: 1
  })
}

export function useDismissAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: dismissAlertsForBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-batches'] })
    }
  })
}
