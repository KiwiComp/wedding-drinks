import { collection, doc } from 'firebase/firestore'
import { db } from '@/shared/firebase/app'
import { readConverter } from '@/shared/firebase/converters'
import { drinkSchema } from '@/shared/schemas/drink'
import { eventConfigSchema } from '@/shared/schemas/eventConfig'
import { orderSchema } from '@/shared/schemas/order'
import { staffSchema } from '@/shared/schemas/staff'

export const drinksRef = collection(db, 'drinks').withConverter(
  readConverter(drinkSchema),
)
export const ordersRef = collection(db, 'orders').withConverter(
  readConverter(orderSchema),
)
export const eventConfigRef = doc(db, 'config', 'event').withConverter(
  readConverter(eventConfigSchema),
)
export const staffRef = (uid: string) =>
  doc(db, 'staff', uid).withConverter(readConverter(staffSchema))
