import { PurchasingSettingsView } from '@/modules/purchasing/ui/PurchasingSettingsView'
import { MenusSettingsView } from '@/modules/menus/ui/MenusSettingsView'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PurchasingSettingsView />
      <MenusSettingsView />
    </div>
  )
}
