import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { KPICard } from './KPICard'

describe('KPICard', () => {
  it('renders label, value and hint', () => {
    render(<KPICard label="Eventos" value={4} hint="Semana" />)

    expect(screen.getByText('Eventos')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('Semana')).toBeInTheDocument()
  })
})
