import { describe, expect, it } from 'vitest'
import { staffSchema } from '@/shared/schemas/staff'

describe('staffSchema', () => {
  it('parses a valid staff document', () => {
    const staff = { id: 'bar-1', displayName: 'Bar staff' }
    expect(staffSchema.parse(staff)).toEqual(staff)
  })

  it('rejects an empty displayName', () => {
    expect(
      staffSchema.safeParse({ id: 'bar-1', displayName: '' }).success,
    ).toBe(false)
  })
})
