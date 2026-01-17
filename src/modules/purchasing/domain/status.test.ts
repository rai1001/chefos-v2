import { describe, expect, it } from 'vitest'
import { canTransition, nextStatusOptions } from './status'

describe('purchase status transitions', () => {
  it('allows draft to approved', () => {
    expect(canTransition('draft', 'approved')).toBe(true)
  })

  it('blocks invalid transitions', () => {
    expect(canTransition('draft', 'received')).toBe(false)
  })

  it('returns next options', () => {
    expect(nextStatusOptions('approved')).toEqual(['ordered', 'received'])
  })
})
