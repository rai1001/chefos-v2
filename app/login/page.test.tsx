import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoginPage from './page'

describe('LoginPage', () => {
  it('muestra el formulario de login placeholder', () => {
    render(<LoginPage />)

    expect(screen.getByText(/Bienvenido a ChefOS/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /iniciar sesi.n/i })).toBeInTheDocument()
  })
})
