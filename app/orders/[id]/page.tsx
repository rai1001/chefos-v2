import { PurchaseOrderDetailView } from '@/modules/purchasing/ui/PurchaseOrderDetailView'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PurchaseOrderDetailView orderId={id} />
}
