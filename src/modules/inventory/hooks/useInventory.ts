'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/providers'
import {
  assignBarcode,
  dismissAlertsForBatch,
  listInventoryBatches,
  listInventoryLocations,
  listSupplierItemsForBarcode,
  lookupBarcode
} from '../data/inventoryApi'

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

export function useBarcodeLookup() {
  return useMutation({
    mutationFn: lookupBarcode
  })
}

export function useAssignBarcode() {
  return useMutation({
    mutationFn: assignBarcode
  })
}

export function useSupplierItemsForBarcode() {
  const { session } = useAuth()
  return useQuery({
    queryKey: ['barcode-supplier-items', session?.user?.id],
    queryFn: listSupplierItemsForBarcode,
    enabled: Boolean(session),
    staleTime: 30_000,
    retry: 1
  })
}
