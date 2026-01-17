import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('renderiza el nav y el contenido', () => {
    render(
      <AppShell>
        <div data-testid="child">body</div>
      </AppShell>
    )

    expect(screen.getByRole('button', { name: /Cerrar sesión/i })).toBeInTheDocument()
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })
})
