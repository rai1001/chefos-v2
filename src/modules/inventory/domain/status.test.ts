import { describe, expect, it } from 'vitest'
import { getExpiryStatus } from './status'

describe('getExpiryStatus', () => {
  it('returns ok when there are no alerts', () => {
    expect(getExpiryStatus([])).toBe('ok')
  })

  it('returns warning when there is an open warning', () => {
    expect(getExpiryStatus([{ severity: 'warning', status: 'open' }])).toBe('warning')
  })

  it('returns critical when there is an open critical', () => {
    expect(getExpiryStatus([
      { severity: 'warning', status: 'open' },
      { severity: 'critical', status: 'open' }
    ])).toBe('critical')
  })

  it('returns ok when all alerts are dismissed', () => {
    expect(getExpiryStatus([{ severity: 'critical', status: 'dismissed' }])).toBe('ok')
  })
})
