import { AppShell } from '@/modules/shared/ui/AppShell'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { SkeletonGrid } from '@/modules/shared/ui/SkeletonGrid'

export default function EventsPage() {
  return (
    <AppShell title="Eventos" description="Calendario y filtros placeholder">
      <PageHeader title="Eventos" description="Espacio para listar eventos y aplicar filtros" />
      <SkeletonGrid />
    </AppShell>
  )
}
