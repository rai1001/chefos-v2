import { ReactNode } from 'react'

interface WizardStep {
  title: string
  description?: string
  content: ReactNode
}

export function WizardStepper({
  steps,
  activeStep,
  onNext,
  onBack,
  onSubmit,
  nextLabel,
  submitLabel
}: {
  steps: WizardStep[]
  activeStep: number
  onNext: () => void
  onBack: () => void
  onSubmit: () => void
  nextLabel?: string
  submitLabel?: string
}) {
  const isLast = activeStep === steps.length - 1
  const current = steps[activeStep]

  return (
    <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6">
      <div className="mb-6 flex flex-wrap gap-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.3em] ${
              index === activeStep
                ? 'border-amber-500/60 bg-amber-500/10 text-amber-200'
                : 'border-slate-700/70 text-slate-400'
            }`}
          >
            {index + 1}. {step.title}
          </div>
        ))}
      </div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white">{current.title}</h2>
        {current.description && <p className="text-sm text-slate-400">{current.description}</p>}
      </div>
      <div className="mb-6">{current.content}</div>
      <div className="flex flex-wrap justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={activeStep === 0}
          className="rounded-full border border-slate-700/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-300 disabled:opacity-40"
        >
          Atras
        </button>
        {isLast ? (
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950"
          >
            {submitLabel ?? 'Crear evento'}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950"
          >
            {nextLabel ?? 'Siguiente'}
          </button>
        )}
      </div>
    </div>
  )
}
