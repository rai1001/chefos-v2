import { supabaseClient } from '@/lib/supabase/client'
import { DashboardData, DashboardHighlight, DashboardRollingDay, DashboardKpi } from '../domain/types'

interface HighlightRow {
  event_id: string
  title: string
  starts_at: string
  status: string
  hotel_name: string
}

interface RollingRow {
  day: string
  events_count: number
}

function buildKpis(rollingGrid: DashboardRollingDay[], highlights: DashboardHighlight[]): DashboardKpi[] {
  const totalEvents = rollingGrid.reduce((sum, day) => sum + day.eventsCount, 0)
  const activeDays = rollingGrid.filter((day) => day.eventsCount > 0).length

  return [
    { label: 'Eventos semana', value: totalEvents, hint: 'Total en los proximos 7 dias' },
    { label: 'Dias con eventos', value: activeDays, hint: 'Dias con actividad' },
    { label: 'Highlights', value: highlights.length, hint: 'Eventos destacados' }
  ]
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [highlightsResult, rollingResult] = await Promise.all([
    supabaseClient.rpc('dashboard_event_highlights'),
    supabaseClient.rpc('dashboard_rolling_grid')
  ])

  if (highlightsResult.error) {
    throw new Error(highlightsResult.error.message)
  }
  if (rollingResult.error) {
    throw new Error(rollingResult.error.message)
  }

  const highlights = ((highlightsResult.data as HighlightRow[] | null) ?? []).map<DashboardHighlight>((row) => ({
    eventId: row.event_id,
    title: row.title,
    startsAt: row.starts_at,
    status: row.status,
    hotelName: row.hotel_name
  }))

  const rollingGrid = ((rollingResult.data as RollingRow[] | null) ?? []).map<DashboardRollingDay>((row) => ({
    day: row.day,
    eventsCount: row.events_count
  }))

  return {
    highlights,
    rollingGrid,
    kpis: buildKpis(rollingGrid, highlights)
  }
}
