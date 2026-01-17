'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Banner } from '@/modules/shared/ui/SkeletonGrid'
import { WizardStepper } from '@/modules/shared/ui/WizardStepper'
import { useActiveOrg } from '@/modules/orgs/hooks/useActiveOrg'
import { createEvent, createEventService, createSpaceBooking } from '../data/eventsApi'
import { useSpacesByHotel } from '../hooks/useEvents'

const SERVICE_TYPES = [
  { value: 'coffee_break', label: 'Coffee break' },
  { value: 'dinner', label: 'Cena' },
  { value: 'production', label: 'Produccion' }
]

const SERVICE_FORMATS = [
  { value: 'de_pie', label: 'De pie' },
  { value: 'sentado', label: 'Sentado' }
]

export function EventWizard() {
  const router = useRouter()
  const { orgId, hotels, activeHotelId, setActiveHotelId } = useActiveOrg()
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [hotelId, setHotelId] = useState(activeHotelId ?? '')
  const [spaceId, setSpaceId] = useState('')
  const [bookingStartsAt, setBookingStartsAt] = useState('')
  const [bookingEndsAt, setBookingEndsAt] = useState('')
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0].value)
  const [serviceFormat, setServiceFormat] = useState(SERVICE_FORMATS[0].value)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const selectedHotelId = hotelId || activeHotelId || ''
  const { data: spaces, isLoading: loadingSpaces } = useSpacesByHotel(selectedHotelId || null)

  const detailsValid = useMemo(() => {
    if (!title.trim() || !startsAt || !endsAt || !selectedHotelId) return false
    return new Date(startsAt) < new Date(endsAt)
  }, [title, startsAt, endsAt, selectedHotelId])

  const bookingValid = useMemo(() => {
    if (!spaceId || !bookingStartsAt || !bookingEndsAt) return false
    return new Date(bookingStartsAt) < new Date(bookingEndsAt)
  }, [spaceId, bookingStartsAt, bookingEndsAt])

  const steps = [
    {
      title: 'Detalles',
      description: 'Define titulo, fechas y hotel.',
      content: (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Titulo
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Evento ChefOS"
              required
            />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Hotel
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
              value={selectedHotelId}
              onChange={(event) => {
                const value = event.target.value
                setHotelId(value)
                setActiveHotelId(value)
              }}
              required
            >
              <option value="">Selecciona un hotel</option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Inicio
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
              type="datetime-local"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              required
            />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Fin
            <input
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
              type="datetime-local"
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
              required
            />
          </label>
        </div>
      )
    },
    {
      title: 'Espacios',
      description: 'Selecciona un espacio y horario.',
      content: (
        <div className="space-y-4">
          {loadingSpaces ? (
            <p className="text-sm text-slate-400">Cargando espacios...</p>
          ) : spaces && spaces.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {spaces.map((space) => (
                <label
                  key={space.id}
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    spaceId === space.id
                      ? 'border-amber-500/60 bg-amber-500/10 text-amber-100'
                      : 'border-slate-800/70 bg-slate-900/60 text-slate-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="space"
                    value={space.id}
                    checked={spaceId === space.id}
                    onChange={() => setSpaceId(space.id)}
                    className="mr-2"
                  />
                  {space.name}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No hay espacios disponibles para este hotel.</p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Inicio reserva
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
                type="datetime-local"
                value={bookingStartsAt}
                onChange={(event) => setBookingStartsAt(event.target.value)}
                required
              />
            </label>
            <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Fin reserva
              <input
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
                type="datetime-local"
                value={bookingEndsAt}
                onChange={(event) => setBookingEndsAt(event.target.value)}
                required
              />
            </label>
          </div>
        </div>
      )
    },
    {
      title: 'Servicios',
      description: 'Define el servicio principal.',
      content: (
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Tipo
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
              value={serviceType}
              onChange={(event) => setServiceType(event.target.value)}
            >
              {SERVICE_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Formato
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-white"
              value={serviceFormat}
              onChange={(event) => setServiceFormat(event.target.value)}
            >
              {SERVICE_FORMATS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )
    },
    {
      title: 'Resumen',
      description: 'Revisa los datos antes de crear el evento.',
      content: (
        <div className="space-y-3 text-sm text-slate-300">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Evento</p>
            <p className="text-white">{title}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Horario</p>
            <p>{startsAt} - {endsAt}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Espacio</p>
            <p>{spaceId ? 'Espacio seleccionado' : 'Sin espacio'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Servicio</p>
            <p>{serviceType} · {serviceFormat}</p>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    setError(null)
    if (step === 0 && !detailsValid) {
      setError('Completa titulo, hotel y fechas validas.')
      return
    }
    if (step === 1 && !bookingValid) {
      setError('Selecciona espacio y horario valido.')
      return
    }
    setStep((prev) => Math.min(prev + 1, steps.length - 1))
  }

  const handleBack = () => {
    setError(null)
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    if (!orgId) {
      setError('No se pudo resolver la organizacion activa.')
      return
    }
    if (!detailsValid || !bookingValid) {
      setError('Completa todos los datos requeridos.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const created = await createEvent({
        orgId,
        hotelId: selectedHotelId,
        title,
        startsAt,
        endsAt,
        status: 'draft'
      })

      await createSpaceBooking({
        orgId,
        eventId: created.id,
        spaceId,
        startsAt: bookingStartsAt,
        endsAt: bookingEndsAt
      })

      await createEventService({
        orgId,
        eventId: created.id,
        serviceType,
        format: serviceFormat
      })

      router.push(`/events/${created.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'No se pudo crear el evento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && <Banner message={error} type="error" />}
      {loading && <Banner message="Guardando evento..." />}
      <WizardStepper
        steps={steps}
        activeStep={step}
        onNext={handleNext}
        onBack={handleBack}
        onSubmit={handleSubmit}
        submitLabel="Crear evento"
      />
    </div>
  )
}
