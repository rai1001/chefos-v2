import { DashboardView } from '@/modules/dashboard/ui/DashboardView'
import { ProductionBoard } from '@/modules/production/ui/ProductionBoard'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <DashboardView />
      <ProductionBoard />
    </div>
  )
}
