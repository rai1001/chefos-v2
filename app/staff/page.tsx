import { AppShell } from '@/modules/shared/ui/AppShell'
import { PageHeader } from '@/modules/shared/ui/PageHeader'
import { SkeletonGrid } from '@/modules/shared/ui/SkeletonGrid'

export default function StaffPage() {
  return (
    <AppShell title="Staff">
      <PageHeader title="Staff" description="Calendario semanal placeholder" />
      <SkeletonGrid />
    </AppShell>
  )
}
