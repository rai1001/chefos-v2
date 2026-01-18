const BARCODE_PATTERN = /^[0-9]{8,14}$/

export function isValidBarcode(value: string): boolean {
  return BARCODE_PATTERN.test(value.trim())
}
