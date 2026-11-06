import { readFileSync } from 'node:fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

const paths = ['drinks/gin-tonic', 'config/event']

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
    await setDoc(doc(db, 'config/event'), { name: 'Test', tableCount: 8 })
    await setDoc(doc(db, 'drinks/gin-tonic'), {
      name: 'G&T',
      category: 'cocktail',
      ingredients: ['Gin', 'Tonic', 'Lime'],
      available: true,
      sortOrder: 0,
    })
  })
})

afterAll(() => env.cleanup())

const contexts: [string, () => RulesTestContext][] = [
  ['an unauthenticated user', () => env.unauthenticatedContext()],
  ['a signed-in user', () => env.authenticatedContext('guest-1')],
]

describe.each(contexts)('the menu rules for %s', (_, context) => {
  it.each(paths)('allow reading %s', async (path) => {
    await assertSucceeds(getDoc(doc(context().firestore(), path)))
  })

  it('allow listing drinks', async () => {
    await assertSucceeds(getDocs(collection(context().firestore(), 'drinks')))
  })

  it.each(['drinks', 'config'])('deny creating in %s', async (path) => {
    await assertFails(
      addDoc(collection(context().firestore(), path), { created: true }),
    )
  })

  it.each(paths)('deny updating %s', async (path) => {
    await assertFails(
      updateDoc(doc(context().firestore(), path), { changed: true }),
    )
  })

  it.each(paths)('deny deleting %s', async (path) => {
    await assertFails(deleteDoc(doc(context().firestore(), path)))
  })
})
