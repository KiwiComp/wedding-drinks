import { Timestamp } from 'firebase/firestore'
import { z } from 'zod'

/** The same limits are in firestore.rules. */
export const MAX_ITEMS_PER_ORDER = 20
export const MAX_QUANTITY_PER_ITEM = 10

export const ORDER_STATUSES = ['new', 'preparing', 'done'] as const
export const orderStatusSchema = z.enum(ORDER_STATUSES)
export type OrderStatus = z.infer<typeof orderStatusSchema>

/** The same transitions are in firestore.rules. Done means the drinks have been served at the table. */
const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  new: ['preparing', 'done'],
  preparing: ['done'],
  done: [],
}

export const canTransition = (from: OrderStatus, to: OrderStatus): boolean =>
  ORDER_STATUS_TRANSITIONS[from].includes(to)

/** The name is copied in, so that the bar sees the right drink even if the menu changes. */
export const orderItemSchema = z.object({
  drinkId: z.string().min(1),
  name: z.string().min(1).max(60),
  quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_ITEM),
})
export type OrderItem = z.infer<typeof orderItemSchema>

const timestampSchema = z
  .instanceof(Timestamp)
  .transform((timestamp) => timestamp.toDate())

/** orders/{orderId} */
export const orderSchema = z.object({
  id: z.string().min(1),
  table: z.number().int().min(1),
  items: z.array(orderItemSchema).min(1).max(MAX_ITEMS_PER_ORDER),
  status: orderStatusSchema,
  createdAt: timestampSchema,
  createdBy: z.string().min(1),
})
export type Order = z.infer<typeof orderSchema>

/** What the guest sends. createOrder adds status, createdAt and createdBy. */
export const newOrderSchema = orderSchema.pick({ table: true, items: true })
export type NewOrder = z.infer<typeof newOrderSchema>
