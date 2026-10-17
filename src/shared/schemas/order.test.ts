import { Timestamp } from 'firebase/firestore'
import { describe, expect, it } from 'vitest'
import {
  canTransition,
  newOrderSchema,
  orderSchema,
  type OrderStatus,
} from '@/shared/schemas/order'

describe('canTransition', () => {
  it.each<[OrderStatus, OrderStatus, boolean]>([
    ['new', 'new', false],
    ['new', 'preparing', true],
    ['new', 'done', true],
    ['preparing', 'new', false],
    ['preparing', 'preparing', false],
    ['preparing', 'done', true],
    ['done', 'new', false],
    ['done', 'preparing', false],
    ['done', 'done', false],
  ])('%s to %s is %s', (from, to, expected) => {
    expect(canTransition(from, to)).toBe(expected)
  })
})

const item = { drinkId: 'gin-tonic', name: 'G&T', quantity: 2 }
const createdAt = new Date('2026-06-06T18:30:00Z')

const order = {
  id: 'order-1',
  table: 3,
  items: [item],
  status: 'new',
  createdAt: Timestamp.fromDate(createdAt),
  createdBy: 'guest-1',
}

describe('orderSchema', () => {
  it('parses a valid order and turns createdAt into a Date', () => {
    expect(orderSchema.parse(order)).toEqual({ ...order, createdAt })
  })

  it.each([
    ['no items', { items: [] }],
    ['21 items', { items: Array.from({ length: 21 }, () => item) }],
    ['a quantity of 0', { items: [{ ...item, quantity: 0 }] }],
    ['a quantity of 11', { items: [{ ...item, quantity: 11 }] }],
    ['an unknown status', { status: 'served' }],
    ['a table of 0', { table: 0 }],
    ['a createdAt that is not a Timestamp', { createdAt }],
  ])('rejects %s', (_, change) => {
    expect(orderSchema.safeParse({ ...order, ...change }).success).toBe(false)
  })
})

describe('newOrderSchema', () => {
  it('keeps only table and items', () => {
    expect(newOrderSchema.parse(order)).toEqual({ table: 3, items: [item] })
  })
})
