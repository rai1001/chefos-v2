import { PurchaseStatus } from './types'

export function canTransition(current: PurchaseStatus, next: PurchaseStatus) {
  if (current === next) return true
  if (current === 'draft') return next === 'approved'
  if (current === 'approved') return next === 'ordered' || next === 'received'
  if (current === 'ordered') return next === 'received'
  return false
}

export function nextStatusOptions(current: PurchaseStatus): PurchaseStatus[] {
  if (current === 'draft') return ['approved']
  if (current === 'approved') return ['ordered', 'received']
  if (current === 'ordered') return ['received']
  return []
}
