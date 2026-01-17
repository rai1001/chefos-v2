export interface EventListItem {
  id: string
  title: string
  startsAt: string
  endsAt: string
  status: string
  hotelId: string
  hotelName?: string | null
}

export interface EventDetail {
  id: string
  title: string
  startsAt: string
  endsAt: string
  status: string
  hotelId: string
  hotelName?: string | null
}

export interface Space {
  id: string
  name: string
}

export interface SpaceBooking {
  id: string
  spaceId: string
  spaceName?: string | null
  startsAt: string
  endsAt: string
}

export interface EventService {
  id: string
  serviceType: string
  format: string
}

export interface EventDetailBundle {
  event: EventDetail
  services: EventService[]
  bookings: SpaceBooking[]
}
