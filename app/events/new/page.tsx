import { AppShell } from '@/modules/shared/ui/AppShell'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { EventWizard } from '@/modules/events/ui/EventWizard'

export default function NewEventPage() {
  return (
    <AppShell title="Crear evento">
      <PageHeader title="Nuevo evento" description="Wizard de creacion" />
      <EventWizard />
    </AppShell>
  )
}
