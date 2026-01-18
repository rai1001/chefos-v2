import { supabaseClient } from '@/lib/supabase/client'
import type { Shift, TimeOff, Shortage } from '../domain/types'

interface ShiftRow {
  id: string
  starts_at: string
  ends_at: string
  role?: string | null
  status: 'scheduled' | 'done' | 'cancelled'
}

interface TimeOffRow {
  id: string
  starts_at: string
  ends_at: string
  type: 'vacation' | 'sick' | 'other'
}

export async function listShifts(): Promise<Shift[]> {
  const { data, error } = await supabaseClient
    .from('shifts')
    .select('id, starts_at, ends_at, role, status')
    .order('starts_at')

  if (error) throw new Error(error.message)

  return ((data as unknown as ShiftRow[]) ?? []).map((row) => ({
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    role: row.role ?? undefined,
    status: row.status
  }))
}

export async function listTimeOff(): Promise<TimeOff[]> {
  const { data, error } = await supabaseClient
    .from('time_off')
    .select('id, starts_at, ends_at, type')
    .order('starts_at')

  if (error) throw new Error(error.message)

  return ((data as unknown as TimeOffRow[]) ?? []).map((row) => ({
    id: row.id,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    type: row.type
  }))
}

export async function createShift(payload: {
  startsAt: string
  endsAt: string
  role?: string
}): Promise<void> {
  const { error } = await supabaseClient.from('shifts').insert({
    starts_at: payload.startsAt,
    ends_at: payload.endsAt,
    role: payload.role ?? null
  })
  if (error) throw new Error(error.message)
}

export async function createTimeOff(payload: { startsAt: string; endsAt: string; type: TimeOff['type'] }) {
  const { error } = await supabaseClient.from('time_off').insert({
    starts_at: payload.startsAt,
    ends_at: payload.endsAt,
    type: payload.type
  })
  if (error) throw new Error(error.message)
}

export async function listShortages(start?: string, end?: string): Promise<Shortage[]> {
  const { data, error } = await supabaseClient.rpc('get_staff_shortages', {
    p_start: start ?? null,
    p_end: end ?? null
  })
  if (error) throw new Error(error.message)
  return (data as Shortage[]) ?? []
}
