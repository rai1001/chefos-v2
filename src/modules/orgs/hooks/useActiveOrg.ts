'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabaseClient } from '@/lib/supabase/client'
import { getCookieValue, setCookieValue } from '@/lib/helpers/cookies'

export interface Hotel {
  id: string
  name: string
}

export function useActiveOrg() {
  const [orgId, setOrgId] = useState<string | null>(null)
  const [orgName, setOrgName] = useState<string | null>(null)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [activeHotelId, setActiveHotelId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedOrg = getCookieValue('chefos-active-org')
    if (storedOrg) {
      setOrgId(storedOrg)
    }
  }, [])

  useEffect(() => {
    if (!orgId) return

    let cancelled = false
    const shouldSelectDefaultHotel = activeHotelId === null

    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const [hotelsResult, orgResult] = await Promise.all([
          supabaseClient
            .from('hotels')
            .select('id, name')
            .eq('org_id', orgId)
            .order('name'),
          supabaseClient.from('orgs').select('name').eq('id', orgId).single()
        ])

        if (cancelled) return

        if (hotelsResult.error) {
          throw new Error(hotelsResult.error.message)
        }

        setHotels(hotelsResult.data ?? [])

        if (shouldSelectDefaultHotel && (hotelsResult.data?.length ?? 0) > 0) {
          setActiveHotelId(hotelsResult.data![0].id)
        }

        if (orgResult.error) {
          throw new Error(orgResult.error.message)
        }

        setOrgName(orgResult.data?.name ?? null)
      } catch (error) {
        if (cancelled) return
        setError(error instanceof Error ? error.message : 'No se pudieron cargar los hoteles')
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [orgId])

  useEffect(() => {
    if (activeHotelId) {
      setCookieValue('chefos-active-hotel', activeHotelId, { path: '/' })
    }
  }, [activeHotelId])

  const state = useMemo(
    () => ({
      orgId,
      orgName,
      hotels,
      activeHotelId,
      loading,
      error
    }),
    [orgId, orgName, hotels, activeHotelId, loading, error]
  )

  return {
    ...state,
    setActiveHotelId
  }
}
