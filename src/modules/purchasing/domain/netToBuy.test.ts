import { describe, expect, it } from 'vitest'
import { calculateNetToBuy, calculateRoundedQty } from './netToBuy'

describe('calculateNetToBuy', () => {
  it('resta disponible y nunca baja de cero', () => {
    expect(calculateNetToBuy(10, 4)).toBe(6)
    expect(calculateNetToBuy(5, 7)).toBe(0)
  })
})

describe('calculateRoundedQty', () => {
  it('redondea al entero superior cuando es ceil_unit', () => {
    expect(calculateRoundedQty(2.2, 'ceil_unit')).toBe(3)
  })

  it('redondea al pack cuando es ceil_pack', () => {
    expect(calculateRoundedQty(6, 'ceil_pack', 5)).toBe(10)
  })

  it('usa el valor base cuando no hay regla', () => {
    expect(calculateRoundedQty(3.5, 'none')).toBe(3.5)
  })
})
