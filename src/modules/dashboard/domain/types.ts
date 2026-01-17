export interface DashboardHighlight {
  eventId: string
  title: string
  startsAt: string
  status: string
  hotelName: string
}

export interface DashboardRollingDay {
  day: string
  eventsCount: number
}

export interface DashboardKpi {
  label: string
  value: number
  hint?: string
}

export interface DashboardData {
  highlights: DashboardHighlight[]
  rollingGrid: DashboardRollingDay[]
  kpis: DashboardKpi[]
}
