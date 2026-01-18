'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createShift, createTimeOff, listShifts, listShortages, listTimeOff } from '../data/staffApi'

export function useShifts() {
  return useQuery({
    queryKey: ['shifts'],
    queryFn: listShifts,
    staleTime: 10_000,
    retry: 1
  })
}

export function useTimeOff() {
  return useQuery({
    queryKey: ['time-off'],
    queryFn: listTimeOff,
    staleTime: 10_000,
    retry: 1
  })
}

export function useShortages() {
  return useQuery({
    queryKey: ['shortages'],
    queryFn: () => listShortages()
  })
}

export function useCreateShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      queryClient.invalidateQueries({ queryKey: ['shortages'] })
    }
  })
}

export function useCreateTimeOff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTimeOff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-off'] })
    }
  })
}
