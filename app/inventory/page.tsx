import { AppShell } from '@/modules/shared/ui/AppShell'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { Banner } from '@/modules/shared/ui/SkeletonGrid'

export default function InventoryPage() {
  return (
    <AppShell title="Inventario">
      <PageHeader title="Inventario" description="Alertas de stock y caducidad" />
      <Banner message="Alertas de caducidad serán visibles en Sprint 05" />
    </AppShell>
  )
}
