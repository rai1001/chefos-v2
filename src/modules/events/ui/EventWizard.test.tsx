import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { EventWizard } from './EventWizard'

vi.mock('@/modules/orgs/hooks/useActiveOrg', () => ({
  useActiveOrg: () => ({
    orgId: '11111111-1111-1111-1111-111111111111',
    hotels: [{ id: '22222222-2222-2222-2222-222222222222', name: 'Hotel Central' }],
    activeHotelId: '22222222-2222-2222-2222-222222222222',
    setActiveHotelId: vi.fn()
  })
}))

vi.mock('../hooks/useEvents', () => ({
  useSpacesByHotel: () => ({
    data: [{ id: 'space-1', name: 'Salon Azul' }],
    isLoading: false
  })
}))

describe('EventWizard', () => {
  it('shows validation error when details are missing', async () => {
    render(<EventWizard />)

    await userEvent.click(screen.getByRole('button', { name: /siguiente/i }))

    expect(screen.getByText(/Completa titulo, hotel y fechas validas/i)).toBeInTheDocument()
  })
})
