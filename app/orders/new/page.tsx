import { AppShell } from '@/modules/shared/ui/AppShell'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { Banner } from '@/modules/shared/ui/SkeletonGrid'

export default function OrdersNewPage() {
  return (
    <AppShell title="Crear pedido">
      <PageHeader title="Nuevo pedido" description="Creacion rapida de pedidos" />
      <Banner message="Creacion avanzada disponible en Sprint 05. Usa el pedido demo para validar flujo." />
    </AppShell>
  )
}
