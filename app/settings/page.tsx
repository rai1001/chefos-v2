import { AppShell } from '@/modules/shared/ui/AppShell'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { Banner } from '@/modules/shared/ui/SkeletonGrid'

export default function SettingsPage() {
  return (
    <AppShell title="Configuración">
      <PageHeader title="Configuración" description="Administración placeholder" />
      <Banner message="Gestión de proveedores/recetas estará lista en Sprint 04" />
    </AppShell>
  )
}
