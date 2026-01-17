import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DashboardView } from './DashboardView'

vi.mock('../hooks/useDashboardData', () => ({
  useDashboardData: () => ({
    data: {
      kpis: [
        { label: 'Eventos semana', value: 3 },
        { label: 'Dias con eventos', value: 2 },
        { label: 'Highlights', value: 1 }
      ],
      highlights: [
        {
          eventId: 'event-1',
          title: 'Demo ChefOS',
          startsAt: new Date().toISOString(),
          status: 'confirmed',
          hotelName: 'Hotel Central'
        }
      ],
      rollingGrid: [
        { day: '2026-01-01T00:00:00.000Z', eventsCount: 1 },
        { day: '2026-01-02T00:00:00.000Z', eventsCount: 2 }
      ]
    },
    isLoading: false,
    error: null
  })
}))

vi.mock('@/modules/orgs/hooks/useActiveOrg', () => ({
  useActiveOrg: () => ({
    orgName: 'ChefOS Owners',
    hotels: [],
    activeHotelId: null,
    setActiveHotelId: vi.fn(),
    loading: false,
    error: null
  })
}))

describe('DashboardView', () => {
  it('renders KPIs and highlights', () => {
    render(<DashboardView />)

    expect(screen.getByText(/KPIs de la semana/i)).toBeInTheDocument()
    expect(screen.getByText('Eventos semana')).toBeInTheDocument()
    expect(screen.getByText('Demo ChefOS')).toBeInTheDocument()
  })
})
