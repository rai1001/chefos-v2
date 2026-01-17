import { AppShell } from '@/modules/shared/ui/AppShell'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { SkeletonGrid } from '@/modules/shared/ui/SkeletonGrid'

export default function OrdersPage() {
  return (
    <AppShell title="Pedidos">
      <PageHeader title="Pedidos" description="Listado placeholder para órdenes" />
      <SkeletonGrid />
    </AppShell>
  )
}
