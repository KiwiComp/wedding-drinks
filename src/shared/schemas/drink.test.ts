import { describe, expect, it } from 'vitest'
import { drinkSchema } from '@/shared/schemas/drink'

const drink = {
  id: 'gin-tonic',
  name: 'G&T',
  category: 'cocktail',
  ingredients: ['Gin', 'Tonic', 'Lime'],
  available: true,
  sortOrder: 0,
}

describe('drinkSchema', () => {
  it('parses a valid drink', () => {
    expect(drinkSchema.parse(drink)).toEqual(drink)
  })

  it.each([
    ['an unknown category', { category: 'cider' }],
    ['an empty name', { name: '' }],
    ['a name longer than 60 characters', { name: 'x'.repeat(61) }],
    ['a negative sortOrder', { sortOrder: -1 }],
  ])('rejects %s', (_, change) => {
    expect(drinkSchema.safeParse({ ...drink, ...change }).success).toBe(false)
  })
})
