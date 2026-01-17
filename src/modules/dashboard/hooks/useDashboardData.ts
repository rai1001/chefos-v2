'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchDashboardData } from '../data/dashboardRpc'
import { useAuth } from '@/providers'

export function useDashboardData() {
  const { session } = useAuth()

  return useQuery({
    queryKey: ['dashboard', session?.user?.id],
    queryFn: fetchDashboardData,
    enabled: Boolean(session),
    staleTime: 30_000,
    retry: 1
  })
}
