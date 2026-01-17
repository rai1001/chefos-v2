import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WizardStepper } from './WizardStepper'

describe('WizardStepper', () => {
  it('renders the current step', () => {
    render(
      <WizardStepper
        steps={[
          { title: 'Paso 1', content: <div>Contenido 1</div> },
          { title: 'Paso 2', content: <div>Contenido 2</div> }
        ]}
        activeStep={0}
        onNext={() => undefined}
        onBack={() => undefined}
        onSubmit={() => undefined}
      />
    )

    expect(screen.getByText('Paso 1')).toBeInTheDocument()
    expect(screen.getByText('Contenido 1')).toBeInTheDocument()
  })
})
