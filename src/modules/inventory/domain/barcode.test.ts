import { describe, expect, it } from 'vitest'
import { isValidBarcode } from './barcode'

describe('isValidBarcode', () => {
  it('acepta solo digitos con longitud valida', () => {
    expect(isValidBarcode('8412345678901')).toBe(true)
    expect(isValidBarcode('12345678')).toBe(true)
    expect(isValidBarcode('ABC123')).toBe(false)
    expect(isValidBarcode('1234')).toBe(false)
  })
})
