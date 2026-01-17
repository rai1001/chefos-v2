import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EventTable } from './EventTable'

describe('EventTable', () => {
  it('renders event rows', () => {
    render(
      <EventTable
        rows={[
          {
            id: 'event-1',
            title: 'Evento Uno',
            startsAt: '2026-01-01T10:00:00Z',
            status: 'draft',
            hotelName: 'Hotel Central'
          }
        ]}
      />
    )

    expect(screen.getByText('Evento Uno')).toBeInTheDocument()
    expect(screen.getByText('Hotel Central')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver/i })).toBeInTheDocument()
  })
})
