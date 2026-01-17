import { supabaseClient } from '@/lib/supabase/client'
import {
  EventDetailBundle,
  EventListItem,
  EventService,
  Space,
  SpaceBooking
} from '../domain/types'

interface EventRow {
  id: string
  title: string
  starts_at: string
  ends_at: string
  status: string
  hotel_id: string
  hotels?: { name: string } | { name: string }[] | null
}

interface SpaceRow {
  id: string
  name: string
}

interface BookingRow {
  id: string
  space_id: string
  starts_at: string
  ends_at: string
  spaces?: { name: string } | { name: string }[] | null
}

interface ServiceRow {
  id: string
  service_type: string
  format: string
}

export async function listEvents(): Promise<EventListItem[]> {
  const { data, error } = await supabaseClient
    .from('events')
    .select('id, title, starts_at, ends_at, status, hotel_id, hotels(name)')
    .order('starts_at', { ascending: true })

  if (error) throw new Error(error.message)

  const rows = (data as unknown as EventRow[]) ?? []
  const getHotelName = (hotel: EventRow['hotels']) =>
    Array.isArray(hotel) ? hotel[0]?.name ?? null : hotel?.name ?? null

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    hotelId: row.hotel_id,
    hotelName: getHotelName(row.hotels)
  }))
}

export async function listSpacesByHotel(hotelId: string): Promise<Space[]> {
  const { data, error } = await supabaseClient
    .from('spaces')
    .select('id, name')
    .eq('hotel_id', hotelId)
    .order('name')

  if (error) throw new Error(error.message)

  return (data as SpaceRow[]).map((row) => ({
    id: row.id,
    name: row.name
  }))
}

export async function createEvent(payload: {
  orgId: string
  hotelId: string
  title: string
  startsAt: string
  endsAt: string
  status: string
}): Promise<EventListItem> {
  const { data, error } = await supabaseClient
    .from('events')
    .insert({
      org_id: payload.orgId,
      hotel_id: payload.hotelId,
      title: payload.title,
      starts_at: payload.startsAt,
      ends_at: payload.endsAt,
      status: payload.status
    })
    .select('id, title, starts_at, ends_at, status, hotel_id, hotels(name)')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'No se pudo crear el evento')

  const row = data as EventRow
  const hotelName = Array.isArray(row.hotels) ? row.hotels[0]?.name ?? null : row.hotels?.name ?? null
  return {
    id: row.id,
    title: row.title,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    hotelId: row.hotel_id,
    hotelName
  }
}

export async function createSpaceBooking(payload: {
  orgId: string
  eventId: string
  spaceId: string
  startsAt: string
  endsAt: string
}): Promise<SpaceBooking> {
  const { data, error } = await supabaseClient
    .from('space_bookings')
    .insert({
      org_id: payload.orgId,
      event_id: payload.eventId,
      space_id: payload.spaceId,
      starts_at: payload.startsAt,
      ends_at: payload.endsAt
    })
    .select('id, space_id, starts_at, ends_at, spaces(name)')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'No se pudo reservar el espacio')

  const row = data as BookingRow
  const spaceName = Array.isArray(row.spaces) ? row.spaces[0]?.name ?? null : row.spaces?.name ?? null
  return {
    id: row.id,
    spaceId: row.space_id,
    spaceName,
    startsAt: row.starts_at,
    endsAt: row.ends_at
  }
}

export async function createEventService(payload: {
  orgId: string
  eventId: string
  serviceType: string
  format: string
}): Promise<EventService> {
  const { data, error } = await supabaseClient
    .from('event_services')
    .insert({
      org_id: payload.orgId,
      event_id: payload.eventId,
      service_type: payload.serviceType,
      format: payload.format
    })
    .select('id, service_type, format')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'No se pudo crear el servicio')

  const row = data as ServiceRow
  return {
    id: row.id,
    serviceType: row.service_type,
    format: row.format
  }
}

export async function getEventDetail(eventId: string): Promise<EventDetailBundle> {
  const { data: event, error: eventError } = await supabaseClient
    .from('events')
    .select('id, title, starts_at, ends_at, status, hotel_id, hotels(name)')
    .eq('id', eventId)
    .single()

  if (eventError || !event) throw new Error(eventError?.message ?? 'Evento no encontrado')

  const [servicesResult, bookingsResult] = await Promise.all([
    supabaseClient.from('event_services').select('id, service_type, format').eq('event_id', eventId),
    supabaseClient
      .from('space_bookings')
      .select('id, space_id, starts_at, ends_at, spaces(name)')
      .eq('event_id', eventId)
  ])

  if (servicesResult.error) throw new Error(servicesResult.error.message)
  if (bookingsResult.error) throw new Error(bookingsResult.error.message)

  const eventRow = event as EventRow
  const hotelName = Array.isArray(eventRow.hotels)
    ? eventRow.hotels[0]?.name ?? null
    : eventRow.hotels?.name ?? null

  return {
    event: {
      id: eventRow.id,
      title: eventRow.title,
      startsAt: eventRow.starts_at,
      endsAt: eventRow.ends_at,
      status: eventRow.status,
      hotelId: eventRow.hotel_id,
      hotelName
    },
    services: (servicesResult.data as ServiceRow[]).map((row) => ({
      id: row.id,
      serviceType: row.service_type,
      format: row.format
    })),
    bookings: ((bookingsResult.data as unknown as BookingRow[]) ?? []).map((row) => {
      const spaceName = Array.isArray(row.spaces) ? row.spaces[0]?.name ?? null : row.spaces?.name ?? null
      return {
        id: row.id,
        spaceId: row.space_id,
        spaceName,
        startsAt: row.starts_at,
        endsAt: row.ends_at
      }
    })
  }
}

export async function updateEventStatus(eventId: string, status: string): Promise<void> {
  const { error } = await supabaseClient.from('events').update({ status }).eq('id', eventId)
  if (error) throw new Error(error.message)
}
