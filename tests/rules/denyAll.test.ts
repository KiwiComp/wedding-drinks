import { readFileSync } from 'node:fs'
import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

const paths = [
  'orders/order-1',
  'drinks/gin-tonic',
  'staff/bar-1',
  'config/event',
]

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-wedding-drinks',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
})

beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await Promise.all(
      paths.map((path) => setDoc(doc(db, path), { seeded: true })),
    )
  })
})

afterAll(() => env.cleanup())

const contexts: [string, () => RulesTestContext][] = [
  ['an unauthenticated user', () => env.unauthenticatedContext()],
  ['a signed-in user', () => env.authenticatedContext('guest-1')],
]

describe.each(contexts)('the deny-all rules for %s', (_, context) => {
  it.each(paths)('deny reading %s', async (path) => {
    await assertFails(getDoc(doc(context().firestore(), path)))
  })

  it.each(paths)('deny writing %s', async (path) => {
    await assertFails(
      setDoc(doc(context().firestore(), path), { changed: true }),
    )
  })

  it.each(paths)('deny deleting %s', async (path) => {
    await assertFails(deleteDoc(doc(context().firestore(), path)))
  })

  it('deny listing orders', async () => {
    await assertFails(getDocs(collection(context().firestore(), 'orders')))
  })
})
