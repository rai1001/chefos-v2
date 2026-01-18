'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/modules/shared/ui/AppShell'
import { Banner, SkeletonGrid } from '@/modules/shared/ui/SkeletonGrid'
import { PageHeader } from '@/modules/shared/ui/PageHeader'

type Step = 'upload' | 'scan' | 'review' | 'commit'

export function ImporterView() {
  const [step, setStep] = useState<Step>('upload')
  const [message, setMessage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const goNext = () => {
    if (step === 'upload') setStep('scan')
    else if (step === 'scan') setStep('review')
    else if (step === 'review') setStep('commit')
  }

  const handleUpload = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const input = event.currentTarget.elements.namedItem('file') as HTMLInputElement | null
    const file = input?.files?.[0]
    if (!file) {
      setMessage('Selecciona un archivo para continuar.')
      return
    }
    setFileName(file.name)
    setMessage('Archivo recibido, iniciando OCR...')
    setValidationErrors([])
    setStep('scan')
    setTimeout(() => {
      setMessage('OCR completado, revisa la tabla de staging.')
      setStep('review')
      setValidationErrors(['Fila 2: proveedor desconocido', 'Fila 4: fecha invalida'])
    }, 400)
  }

  const handleCommit = () => {
    if (validationErrors.length > 0) {
      setMessage('Corrige los errores antes de confirmar.')
      return
    }
    setMessage('Importacion confirmada.')
    setStep('commit')
  }

  return (
    <AppShell title="Importer OCR" description="Sube, valida y commitea datos por OCR">
      <PageHeader
        title="Importador OCR"
        description="Staging + validacion + commit"
        actions={
          <Link
            href="/inventory"
            className="rounded-full border border-slate-700/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 hover:border-amber-500/60"
          >
            Volver a inventario
          </Link>
        }
      />

      {message && (
        <div className="mb-4">
          <Banner message={message} type="info" />
        </div>
      )}

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {(['upload', 'scan', 'review', 'commit'] as Step[]).map((item) => (
          <div
            key={item}
            className={`rounded-2xl border px-4 py-3 text-xs uppercase tracking-[0.3em] ${
              step === item ? 'border-amber-500/60 text-amber-200' : 'border-slate-800/70 text-slate-400'
            }`}
          >
            {item}
          </div>
        ))}
      </div>

      {step === 'upload' && (
        <form onSubmit={handleUpload} className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Archivo
            <input
              name="file"
              type="file"
              className="mt-2 block w-full text-sm text-slate-100"
              accept=".pdf,.jpg,.png"
            />
          </label>
          <button
            type="submit"
            className="mt-4 rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950"
          >
            Subir y escanear
          </button>
        </form>
      )}

      {step === 'scan' && (
        <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6">
          <p className="text-sm text-slate-300">Procesando OCR para {fileName ?? 'archivo'}</p>
          <div className="mt-4">
            <SkeletonGrid />
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6">
          <p className="mb-3 text-sm text-slate-300">Valida filas antes de confirmar.</p>
          {validationErrors.length === 0 ? (
            <p className="text-sm text-emerald-200">Todo OK, listo para commit.</p>
          ) : (
            <ul className="list-disc pl-6 text-sm text-amber-200">
              {validationErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className="rounded-full border border-slate-700/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200"
              onClick={() => {
                setValidationErrors([])
                setMessage('Errores corregidos en staging.')
              }}
            >
              Marcar corregido
            </button>
            <button
              type="button"
              className="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950"
              onClick={handleCommit}
            >
              Confirmar commit
            </button>
          </div>
        </div>
      )}

      {step === 'commit' && (
        <div className="rounded-3xl border border-emerald-500/50 bg-emerald-950/30 p-6 text-sm text-emerald-100">
          Importacion confirmada y lista en la base de datos.
        </div>
      )}

      {step !== 'commit' && (
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="rounded-full border border-slate-700/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200"
            onClick={goNext}
          >
            Siguiente paso
          </button>
        </div>
      )}
    </AppShell>
  )
}
