import { EventDetailView } from '@/modules/events/ui/EventDetailView'

export default function EventDetailPage({ params }: { params: { id: string } }) {
  return <EventDetailView eventId={params.id} />
}
