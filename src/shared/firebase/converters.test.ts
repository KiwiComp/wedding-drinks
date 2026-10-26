import { Timestamp, type QueryDocumentSnapshot } from 'firebase/firestore'
import { describe, expect, it, vi } from 'vitest'
import { readConverter } from '@/shared/firebase/converters'
import { drinkSchema } from '@/shared/schemas/drink'
import { orderSchema } from '@/shared/schemas/order'

const fakeSnapshot = (id: string, data: Record<string, unknown>) => {
  const dataFn = vi.fn(() => data)
  const snapshot = { id, data: dataFn } as unknown as QueryDocumentSnapshot
  return { snapshot, dataFn }
}

const drink = {
  name: 'G&T',
  category: 'cocktail',
  ingredients: ['Gin', 'Tonic', 'Lime'],
  available: true,
  sortOrder: 0,
}

describe('readConverter', () => {
  const converter = readConverter(drinkSchema)

  it('adds the document id as the field id', () => {
    const { snapshot } = fakeSnapshot('gin-tonic', drink)

    expect(converter.fromFirestore(snapshot)).toEqual({
      id: 'gin-tonic',
      ...drink,
    })
  })

  it('reads server timestamps as estimates', () => {
    const { snapshot, dataFn } = fakeSnapshot('gin-tonic', drink)

    converter.fromFirestore(snapshot, { serverTimestamps: 'none' })

    expect(dataFn).toHaveBeenCalledWith({ serverTimestamps: 'estimate' })
  })

  it('throws on an invalid document', () => {
    const { snapshot } = fakeSnapshot('gin-tonic', { ...drink, available: 1 })

    expect(() => converter.fromFirestore(snapshot)).toThrow()
  })

  it('throws on write', () => {
    expect(() =>
      converter.toFirestore({ id: 'gin-tonic', ...drink } as never),
    ).toThrow(/api\.ts/)
  })

  it('turns a Timestamp into a Date', () => {
    const createdAt = new Date('2026-06-06T18:30:00Z')
    const { snapshot } = fakeSnapshot('order-1', {
      table: 3,
      items: [{ drinkId: 'gin-tonic', name: 'G&T', quantity: 2 }],
      status: 'new',
      createdAt: Timestamp.fromDate(createdAt),
      createdBy: 'guest-1',
    })

    expect(
      readConverter(orderSchema).fromFirestore(snapshot).createdAt,
    ).toEqual(createdAt)
  })
})
