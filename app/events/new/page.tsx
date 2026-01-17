import { AppShell } from '@/modules/shared/ui/AppShell'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { Banner } from '@/modules/shared/ui/SkeletonGrid'

export default function NewEventPage() {
  return (
    <AppShell title="Crear evento">
      <PageHeader title="Nuevo evento" description="Wizard placeholder" />
      <Banner message="La creación real estará disponible en Sprint 03" />
    </AppShell>
  )
}
