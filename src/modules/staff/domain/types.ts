export interface Shift {
  id: string
  userName?: string
  startsAt: string
  endsAt: string
  role?: string
  status: 'scheduled' | 'done' | 'cancelled'
}

export interface TimeOff {
  id: string
  userName?: string
  startsAt: string
  endsAt: string
  type: 'vacation' | 'sick' | 'other'
}

export interface Shortage {
  day: string
  shortage: number
}
