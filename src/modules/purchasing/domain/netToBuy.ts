export function calculateNetToBuy(requestedQty: number, availableOnHand?: number | null): number {
  const available = Number.isFinite(availableOnHand) ? Number(availableOnHand) : 0
  return Math.max(requestedQty - available, 0)
}

export function calculateRoundedQty(
  netToBuy: number,
  roundingRule?: string | null,
  packSize?: number | null
): number {
  if (!Number.isFinite(netToBuy)) return 0

  const rule = roundingRule ?? 'none'

  if (rule === 'ceil_unit') {
    return Math.ceil(netToBuy)
  }

  if (rule === 'ceil_pack') {
    const size = packSize && packSize > 0 ? packSize : 1
    return Math.ceil(netToBuy / size) * size
  }

  return netToBuy
}
