# Data model

This file specifies the Firestore data, the code that reads and writes it, and the security rules. The code is the target for the roadmap steps in phase 1, and has been type-checked with strict TypeScript.

## Collections

Orders are the hub: each order points to drinks on the menu, a table in the event config, and the guest who created it.

| Document | Fields | Points to | Written by |
| --- | --- | --- | --- |
| `orders/{orderId}` | `table`, `items` (`drinkId`, `name`, `quantity`), `status`, `createdAt`, `createdBy` | `items[].drinkId` to `drinks`, `table` up to `config/event.tableCount`, `createdBy` to the guest's Auth uid | Guests create. Staff update `status`. |
| `drinks/{drinkId}` | `name`, `category`, `ingredients`, `available`, `sortOrder` |  | Seed script. Staff update `available`. |
| `staff/{uid}` | `displayName` | The document id is the staff member's Auth uid | Seed script or the Firebase console |
| `config/event` | `name`, `tableCount` |  | Seed script or the Firebase console |

An order moves from `new` to `preparing` or straight to `done`, and from `preparing` to `done`. `done` means the drinks have been served at the table. Each item copies the drink's name, so the bar shows the right drink even if the menu changes.

## Schemas

Each document has a Zod schema in `src/shared/schemas/`, and the types are derived with `z.infer`. The schemas describe documents as the app sees them, with the document id in the field `id` and timestamps as `Date`. The labels for categories and statuses are UI text, so they live in the `category` and `status` groups in [strings.md](strings.md).

**`drink.ts`**

```ts
import { z } from 'zod';

/** The order here is the order of the category tabs in the guest view. */
export const DRINK_CATEGORIES = ['cocktail', 'mocktail', 'wine', 'beer', 'digestif'] as const;

export const drinkCategorySchema = z.enum(DRINK_CATEGORIES);
export type DrinkCategory = z.infer<typeof drinkCategorySchema>;

/** drinks/{drinkId} */
export const drinkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(60),
  category: drinkCategorySchema,
  ingredients: z.array(z.string().min(1)).max(10),
  available: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
});
export type Drink = z.infer<typeof drinkSchema>;
```

**`order.ts`**

```ts
import { Timestamp } from 'firebase/firestore';
import { z } from 'zod';

/** The same limits are in firestore.rules. */
export const MAX_ITEMS_PER_ORDER = 20;
export const MAX_QUANTITY_PER_ITEM = 10;

export const ORDER_STATUSES = ['new', 'preparing', 'done'] as const;
export const orderStatusSchema = z.enum(ORDER_STATUSES);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

/** The same transitions are in firestore.rules. Done means the drinks have been served at the table. */
const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  new: ['preparing', 'done'],
  preparing: ['done'],
  done: [],
};

export const canTransition = (from: OrderStatus, to: OrderStatus): boolean =>
  ORDER_STATUS_TRANSITIONS[from].includes(to);

/** The name is copied in, so that the bar sees the right drink even if the menu changes. */
export const orderItemSchema = z.object({
  drinkId: z.string().min(1),
  name: z.string().min(1).max(60),
  quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_ITEM),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

const timestampSchema = z.instanceof(Timestamp).transform((timestamp) => timestamp.toDate());

/** orders/{orderId} */
export const orderSchema = z.object({
  id: z.string().min(1),
  table: z.number().int().min(1),
  items: z.array(orderItemSchema).min(1).max(MAX_ITEMS_PER_ORDER),
  status: orderStatusSchema,
  createdAt: timestampSchema,
  createdBy: z.string().min(1),
});
export type Order = z.infer<typeof orderSchema>;

/** What the guest sends. createOrder adds status, createdAt and createdBy. */
export const newOrderSchema = orderSchema.pick({ table: true, items: true });
export type NewOrder = z.infer<typeof newOrderSchema>;
```

**`eventConfig.ts`**

```ts
import { z } from 'zod';

/** config/event */
export const eventConfigSchema = z.object({
  name: z.string().min(1),
  tableCount: z.number().int().min(1).max(50),
});
export type EventConfig = z.infer<typeof eventConfigSchema>;

/** Turns :tableId from the URL into a table number, or null if the table does not exist. */
export function parseTableId(raw: string | undefined, config: EventConfig): number | null {
  const table = Number(raw);
  return Number.isInteger(table) && table >= 1 && table <= config.tableCount ? table : null;
}
```

**`staff.ts`**

```ts
import { z } from 'zod';

/** staff/{uid}. A user is staff because this document exists. */
export const staffSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
});
export type Staff = z.infer<typeof staffSchema>;
```

## Client models

Two models exist only in the client: the sign-in state and the cart.

**`features/auth/authState.ts`**

`AuthProvider` listens with `onAuthStateChanged`. When a user is signed in, it reads `staff/{uid}` once, and `isStaff` is `true` if the document exists. The guest view calls `signInAnonymously` when the state is `signedOut`. `/bar` redirects to `/login` when `isStaff` is `false`.

```ts
export type AuthState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; uid: string; isAnonymous: boolean; isStaff: boolean };
```

**`features/ordering/cart.ts`**

The cart maps each `drinkId` to a quantity and is used with `useReducer(cartReducer, emptyCart)`. `unavailableInCart` finds drinks that the bar marked as sold out after the guest added them, so that the guest knows before sending.

```ts
import type { Drink } from '@/shared/schemas/drink';
import { MAX_QUANTITY_PER_ITEM, type OrderItem } from '@/shared/schemas/order';

/** drinkId → quantity. A drink missing from the object has quantity 0. */
export type CartState = Readonly<Record<string, number>>;

export type CartAction =
  | { type: 'increment'; drinkId: string }
  | { type: 'decrement'; drinkId: string }
  | { type: 'clear' };

export const emptyCart: CartState = {};

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'increment': {
      const quantity = state[action.drinkId] ?? 0;
      if (quantity >= MAX_QUANTITY_PER_ITEM) return state;
      return { ...state, [action.drinkId]: quantity + 1 };
    }
    case 'decrement': {
      const quantity = state[action.drinkId] ?? 0;
      if (quantity === 0) return state;
      if (quantity > 1) return { ...state, [action.drinkId]: quantity - 1 };
      const next: Record<string, number> = { ...state };
      delete next[action.drinkId];
      return next;
    }
    case 'clear':
      return emptyCart;
  }
}

export const cartCount = (cart: CartState): number =>
  Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

/** The rows in menu order, with the name copied from the menu. */
export function toOrderItems(cart: CartState, menu: readonly Drink[]): OrderItem[] {
  return menu.flatMap((drink) => {
    const quantity = cart[drink.id] ?? 0;
    return quantity > 0 ? [{ drinkId: drink.id, name: drink.name, quantity }] : [];
  });
}

/** Drinks in the cart that the bar marked as sold out after the guest added them. */
export const unavailableInCart = (cart: CartState, menu: readonly Drink[]): Drink[] =>
  menu.filter((drink) => !drink.available && (cart[drink.id] ?? 0) > 0);
```

## Firebase layer

Reads go through converters that validate with Zod. Writes go through the functions in `api.ts`, without a converter, since they contain `serverTimestamp()`.

**`src/shared/firebase/app.ts`**

```ts
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const db = getFirestore(app);
export const auth = getAuth(app);

if (import.meta.env.VITE_USE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
}
```

**`src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_USE_EMULATORS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

**`src/shared/firebase/converters.ts`**

```ts
import type { FirestoreDataConverter } from 'firebase/firestore';
import type { z } from 'zod';

/**
 * Validates every document that is read, and adds the document id as the field id.
 * Writes go through the functions in api.ts, without a converter.
 */
export function readConverter<T>(schema: z.ZodType<T>): FirestoreDataConverter<T> {
  return {
    toFirestore() {
      throw new Error('Write without withConverter. Writes are validated in api.ts.');
    },
    fromFirestore(snapshot, options) {
      return schema.parse({
        id: snapshot.id,
        ...snapshot.data({ ...options, serverTimestamps: 'estimate' }),
      });
    },
  };
}
```

**`src/shared/firebase/refs.ts`**

```ts
import { collection, doc } from 'firebase/firestore';
import { db } from '@/shared/firebase/app';
import { readConverter } from '@/shared/firebase/converters';
import { drinkSchema } from '@/shared/schemas/drink';
import { eventConfigSchema } from '@/shared/schemas/eventConfig';
import { orderSchema } from '@/shared/schemas/order';
import { staffSchema } from '@/shared/schemas/staff';

export const drinksRef = collection(db, 'drinks').withConverter(readConverter(drinkSchema));
export const ordersRef = collection(db, 'orders').withConverter(readConverter(orderSchema));
export const eventConfigRef = doc(db, 'config', 'event').withConverter(readConverter(eventConfigSchema));
export const staffRef = (uid: string) => doc(db, 'staff', uid).withConverter(readConverter(staffSchema));
```

**`src/shared/firebase/useLiveQuery.ts`**

`QueryState` models loading, errors and data in every view. The result is stored with its query, so `loading` is derived during render instead of being set in the effect.

```ts
import { useEffect, useState } from 'react';
import { onSnapshot, type DocumentReference, type Query } from 'firebase/firestore';

export type QueryState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T };

const toError = (error: unknown): Error => (error instanceof Error ? error : new Error(String(error)));

/**
 * Subscribes to a query while the component is mounted. The result is stored with its query,
 * so that a new query shows loading at once instead of old data.
 * An invalid document is skipped and logged, so that it cannot stop the whole list.
 * The query must be stable: a module constant or created with useMemo.
 */
export function useLiveQuery<T>(query: Query<T>): QueryState<T[]> {
  const [result, setResult] = useState<{ query: Query<T>; state: QueryState<T[]> } | null>(null);

  useEffect(
    () =>
      onSnapshot(
        query,
        (snapshot) => {
          const data = snapshot.docs.flatMap((doc) => {
            try {
              return [doc.data()];
            } catch (error) {
              console.error(`Skipped invalid document: ${doc.ref.path}`, error);
              return [];
            }
          });
          setResult({ query, state: { status: 'success', data } });
        },
        (error) => setResult({ query, state: { status: 'error', error } }),
      ),
    [query],
  );

  return result?.query === query ? result.state : { status: 'loading' };
}

/** The same for a single document. A missing document counts as an error. */
export function useLiveDoc<T>(ref: DocumentReference<T>): QueryState<T> {
  const [result, setResult] = useState<{ ref: DocumentReference<T>; state: QueryState<T> } | null>(null);

  useEffect(
    () =>
      onSnapshot(
        ref,
        (snapshot) => {
          try {
            const data = snapshot.data();
            setResult({
              ref,
              state:
                data === undefined
                  ? { status: 'error', error: new Error(`Document ${ref.path} is missing`) }
                  : { status: 'success', data },
            });
          } catch (error) {
            setResult({ ref, state: { status: 'error', error: toError(error) } });
          }
        },
        (error) => setResult({ ref, state: { status: 'error', error } }),
      ),
    [ref],
  );

  return result?.ref === ref ? result.state : { status: 'loading' };
}
```

### Hooks

**`src/shared/firebase/hooks.ts`**

```ts
import { useLiveDoc, type QueryState } from '@/shared/firebase/useLiveQuery';
import { eventConfigRef } from '@/shared/firebase/refs';
import type { EventConfig } from '@/shared/schemas/eventConfig';

export const useEventConfig = (): QueryState<EventConfig> => useLiveDoc(eventConfigRef);
```

**`src/features/ordering/hooks.ts`**

```ts
import { useMemo } from 'react';
import { orderBy, query, where } from 'firebase/firestore';
import { drinksRef, ordersRef } from '@/shared/firebase/refs';
import { useLiveQuery, type QueryState } from '@/shared/firebase/useLiveQuery';
import type { Drink } from '@/shared/schemas/drink';
import type { Order } from '@/shared/schemas/order';

const menuQuery = query(drinksRef, orderBy('sortOrder'));

export const useMenu = (): QueryState<Drink[]> => useLiveQuery(menuQuery);

/** The where on createdBy is required: the rules reject a query that could return other guests' orders. */
export function useMyOrders(uid: string): QueryState<Order[]> {
  const myOrdersQuery = useMemo(
    () => query(ordersRef, where('createdBy', '==', uid), orderBy('createdAt', 'desc')),
    [uid],
  );
  return useLiveQuery(myOrdersQuery);
}
```

**`src/features/bar/hooks.ts`**

```ts
import { orderBy, query, where } from 'firebase/firestore';
import { ordersRef } from '@/shared/firebase/refs';
import { useLiveQuery, type QueryState } from '@/shared/firebase/useLiveQuery';
import type { Order, OrderStatus } from '@/shared/schemas/order';

const activeStatuses: OrderStatus[] = ['new', 'preparing'];

const activeOrdersQuery = query(ordersRef, where('status', 'in', activeStatuses), orderBy('createdAt'));

export const useActiveOrders = (): QueryState<Order[]> => useLiveQuery(activeOrdersQuery);
```

### Writes

**`src/features/ordering/api.ts`**

```ts
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/shared/firebase/app';
import { newOrderSchema, type NewOrder, type OrderStatus } from '@/shared/schemas/order';

export async function createOrder(input: NewOrder, uid: string): Promise<string> {
  const order = newOrderSchema.parse(input);
  const ref = await addDoc(collection(db, 'orders'), {
    ...order,
    status: 'new' satisfies OrderStatus,
    createdAt: serverTimestamp(),
    createdBy: uid,
  });
  return ref.id;
}
```

**`src/features/bar/api.ts`**

```ts
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/shared/firebase/app';
import { canTransition, type Order, type OrderStatus } from '@/shared/schemas/order';

export async function updateOrderStatus(order: Order, to: OrderStatus): Promise<void> {
  if (!canTransition(order.status, to)) {
    throw new Error(`Invalid status change: ${order.status} to ${to}`);
  }
  await updateDoc(doc(db, 'orders', order.id), { status: to });
}

export async function setDrinkAvailable(drinkId: string, available: boolean): Promise<void> {
  await updateDoc(doc(db, 'drinks', drinkId), { available });
}
```

## Indexes and security rules

The rules mirror the schemas. A guest may only create their own orders for tables that exist. Staff may only move the status forward and mark drinks as sold out, and nobody may delete. These rules have not been run yet: step 1.2 sets up the rules tests, and each rule gets its tests in the step that opens it.

**`firestore.indexes.json`**

The guest's and the bar's queries filter on one field and sort on another, so they need composite indexes.

```json
{
  "indexes": [
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdBy", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

**`firestore.rules`**

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function isStaff() {
      return signedIn()
        && exists(/databases/$(database)/documents/staff/$(request.auth.uid));
    }

    function tableCount() {
      return get(/databases/$(database)/documents/config/event).data.tableCount;
    }

    function isValidNewOrder(order) {
      return order.keys().hasOnly(['table', 'items', 'status', 'createdAt', 'createdBy'])
        && order.keys().hasAll(['table', 'items', 'status', 'createdAt', 'createdBy'])
        && order.table is int
        && order.table >= 1
        && order.table <= tableCount()
        && order.items is list
        && order.items.size() >= 1
        && order.items.size() <= 20
        && order.status == 'new'
        && order.createdAt == request.time
        && order.createdBy == request.auth.uid;
    }

    function isValidTransition(from, to) {
      return (from == 'new' && to in ['preparing', 'done'])
        || (from == 'preparing' && to == 'done');
    }

    match /config/{docId} {
      allow read: if true;
    }

    match /staff/{uid} {
      allow get: if signedIn() && request.auth.uid == uid;
    }

    match /drinks/{drinkId} {
      allow read: if true;
      allow update: if isStaff()
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['available'])
        && request.resource.data.available is bool;
    }

    match /orders/{orderId} {
      allow create: if signedIn() && isValidNewOrder(request.resource.data);
      allow read: if isStaff()
        || (signedIn() && resource.data.createdBy == request.auth.uid);
      allow update: if isStaff()
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status'])
        && isValidTransition(resource.data.status, request.resource.data.status);
    }
  }
}
```

**`tests/rules/orders.test.ts`**

Run with `npm run test:rules`. Start from these tests and add tests for each new rule, for both what is allowed and what is denied.

```ts
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { addDoc, collection, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

let env: RulesTestEnvironment;

const newOrder = (uid: string, table = 3) => ({
  table,
  items: [{ drinkId: 'gin-tonic', name: 'G&T', quantity: 2 }],
  status: 'new',
  createdAt: serverTimestamp(),
  createdBy: uid,
});

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-wedding-drinks',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'config/event'), { name: 'Test', tableCount: 8 });
    await setDoc(doc(db, 'staff/bar-1'), { displayName: 'Bar' });
    await setDoc(doc(db, 'orders/order-1'), { ...newOrder('guest-1'), createdAt: new Date() });
  });
});

afterAll(() => env.cleanup());

describe('orders', () => {
  it('lets a guest create an order for a table that exists', async () => {
    const db = env.authenticatedContext('guest-1').firestore();
    await assertSucceeds(addDoc(collection(db, 'orders'), newOrder('guest-1')));
  });

  it('denies an order for a table that does not exist', async () => {
    const db = env.authenticatedContext('guest-1').firestore();
    await assertFails(addDoc(collection(db, 'orders'), newOrder('guest-1', 9)));
  });

  it("denies an order in someone else's name", async () => {
    const db = env.authenticatedContext('guest-1').firestore();
    await assertFails(addDoc(collection(db, 'orders'), newOrder('guest-2')));
  });

  it('denies a guest changing the status', async () => {
    const db = env.authenticatedContext('guest-1').firestore();
    await assertFails(updateDoc(doc(db, 'orders/order-1'), { status: 'done' }));
  });

  it('lets staff move an order from new to preparing', async () => {
    const db = env.authenticatedContext('bar-1').firestore();
    await assertSucceeds(updateDoc(doc(db, 'orders/order-1'), { status: 'preparing' }));
  });

  it('denies staff changing anything but the status', async () => {
    const db = env.authenticatedContext('bar-1').firestore();
    await assertFails(updateDoc(doc(db, 'orders/order-1'), { table: 5 }));
  });
});
```

## Seed data

The seed script adds the 20 drinks from the wedding menu, `config/event` with 8 tables, and a staff account. It uses the Admin SDK, which bypasses the security rules, and validates the menu with the same Zod schema as the app. The drink names are menu data and stay as they were on the night.

**`scripts/seed.ts`**

```ts
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { drinkSchema, type Drink } from '../src/shared/schemas/drink';
import { eventConfigSchema } from '../src/shared/schemas/eventConfig';

type MenuItem = Pick<Drink, 'id' | 'name' | 'category' | 'ingredients'>;

const menu: MenuItem[] = [
  { id: 'gin-tonic', name: 'G&T', category: 'cocktail', ingredients: ['Gin', 'Tonic', 'Lime'] },
  { id: 'french-75', name: 'French 75', category: 'cocktail', ingredients: ['Gin', 'Citron', 'Socker', 'Mousserande vin'] },
  { id: 'lynchburg-lemonade', name: 'Lynchburg Lemonade', category: 'cocktail', ingredients: ["Jack Daniel's", 'Triple Sec', 'Citron', 'Lemonad'] },
  { id: 'margarita', name: 'Margarita', category: 'cocktail', ingredients: ['Tequila', 'Triple Sec', 'Lime'] },
  { id: 'whiskey-sour', name: 'Whiskey Sour', category: 'cocktail', ingredients: ['Whiskey', 'Citron', 'Socker'] },
  { id: 'aperol-spritz', name: 'Aperol Spritz', category: 'cocktail', ingredients: ['Aperol', 'Mousserande vin', 'Sodavatten'] },
  { id: 'kombucha-mojito', name: 'Kombucha Mojito', category: 'mocktail', ingredients: ['Lime', 'Mynta', 'Socker', 'Krossad is', 'Kombucha'] },
  { id: 'sparkling-rhubarb', name: 'Sparkling Rhubarb', category: 'mocktail', ingredients: ['Rabarbersaft', 'Citronjuice', 'Mousserande'] },
  { id: 'aperol-spritz-0', name: 'Aperol Spritz 0%', category: 'mocktail', ingredients: ['Blodgrape-/Apelsinjuice', 'Ginger Ale', 'Tonic'] },
  { id: 'house-white', name: 'Husets vita vin', category: 'wine', ingredients: [] },
  { id: 'house-rose', name: 'Husets rosévin', category: 'wine', ingredients: [] },
  { id: 'house-red', name: 'Husets röda vin', category: 'wine', ingredients: [] },
  { id: 'sparkling-wine', name: 'Mousserande vin', category: 'wine', ingredients: [] },
  { id: 'peroni', name: 'Peroni', category: 'beer', ingredients: [] },
  { id: 'peroni-0', name: 'Peroni alkoholfri', category: 'beer', ingredients: [] },
  { id: 'whiskey', name: 'Whiskey', category: 'digestif', ingredients: [] },
  { id: 'cognac', name: 'Konjak', category: 'digestif', ingredients: [] },
  { id: 'kaffe-karlsson', name: 'Kaffe Karlsson', category: 'digestif', ingredients: [] },
  { id: 'irish-coffee', name: 'Irish Coffee', category: 'digestif', ingredients: [] },
  { id: 'baileys', name: "Bailey's", category: 'digestif', ingredients: [] },
];

const config = eventConfigSchema.parse({ name: 'The wedding', tableCount: 8 });

const staff = {
  email: process.env.DEMO_STAFF_EMAIL ?? 'bar@demo.test',
  password: process.env.DEMO_STAFF_PASSWORD ?? 'demo-bar-1234',
  displayName: 'Bar staff',
};

initializeApp({ projectId: process.env.GCLOUD_PROJECT ?? 'demo-wedding-drinks' });
const db = getFirestore();
const auth = getAuth();

const batch = db.batch();
batch.set(db.doc('config/event'), config);
menu.forEach((item, index) => {
  const { id, ...drink } = drinkSchema.parse({ ...item, available: true, sortOrder: index });
  batch.set(db.doc(`drinks/${id}`), drink);
});
await batch.commit();

const user = await auth
  .getUserByEmail(staff.email)
  .catch(() => auth.createUser({ email: staff.email, password: staff.password, displayName: staff.displayName }));
await db.doc(`staff/${user.uid}`).set({ displayName: staff.displayName });

console.log(`Seeded ${menu.length} drinks, config/event and the staff account ${staff.email}.`);
```

**Running the script**

- **Against the emulators:** `npm run seed`, which sets `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080` and `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099`.
- **Against the demo project:** set `GCLOUD_PROJECT` to the project id and `GOOGLE_APPLICATION_CREDENTIALS` to a service account key. The key never goes in the repo.
- **Set `DEMO_STAFF_PASSWORD`** when seeding the demo project. The demo password can be in the README, but not the script's default.
