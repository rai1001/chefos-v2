'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/providers'
import { getPurchaseOrderDetail, listPurchaseOrders, listSuppliers, listSupplierItems } from '../data/purchasingApi'

export function useSuppliers() {
  const { session } = useAuth()
  return useQuery({
    queryKey: ['suppliers', session?.user?.id],
    queryFn: listSuppliers,
    enabled: Boolean(session),
    staleTime: 30_000,
    retry: 1
  })
}

export function useSupplierItems(supplierId: string | null) {
  const { session } = useAuth()
  return useQuery({
    queryKey: ['supplier-items', supplierId, session?.user?.id],
    queryFn: () => listSupplierItems(supplierId ?? ''),
    enabled: Boolean(session && supplierId),
    staleTime: 30_000,
    retry: 1
  })
}

export function usePurchaseOrders() {
  const { session } = useAuth()
  return useQuery({
    queryKey: ['purchase-orders', session?.user?.id],
    queryFn: listPurchaseOrders,
    enabled: Boolean(session),
    staleTime: 10_000,
    retry: 1
  })
}

export function usePurchaseOrderDetail(orderId: string) {
  const { session } = useAuth()
  return useQuery({
    queryKey: ['purchase-order', orderId, session?.user?.id],
    queryFn: () => getPurchaseOrderDetail(orderId),
    enabled: Boolean(session && orderId),
    staleTime: 10_000,
    retry: 1
  })
}
