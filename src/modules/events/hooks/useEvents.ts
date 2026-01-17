'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/providers'
import { getEventDetail, listEvents, listSpacesByHotel } from '../data/eventsApi'

export function useEventsList() {
  const { session } = useAuth()

  return useQuery({
    queryKey: ['events', session?.user?.id],
    queryFn: listEvents,
    enabled: Boolean(session),
    staleTime: 10_000,
    retry: 1
  })
}

export function useEventDetail(eventId: string) {
  const { session } = useAuth()

  return useQuery({
    queryKey: ['event-detail', eventId, session?.user?.id],
    queryFn: () => getEventDetail(eventId),
    enabled: Boolean(session && eventId),
    staleTime: 10_000,
    retry: 1
  })
}

export function useSpacesByHotel(hotelId: string | null) {
  const { session } = useAuth()

  return useQuery({
    queryKey: ['spaces', hotelId, session?.user?.id],
    queryFn: () => listSpacesByHotel(hotelId ?? ''),
    enabled: Boolean(session && hotelId),
    staleTime: 30_000,
    retry: 1
  })
}
