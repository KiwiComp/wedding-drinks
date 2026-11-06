import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { drinkSchema, type Drink } from '../src/shared/schemas/drink.ts'
import { eventConfigSchema } from '../src/shared/schemas/eventConfig.ts'

type MenuItem = Pick<Drink, 'id' | 'name' | 'category' | 'ingredients'>

const menu: MenuItem[] = [
  {
    id: 'gin-tonic',
    name: 'G&T',
    category: 'cocktail',
    ingredients: ['Gin', 'Tonic', 'Lime'],
  },
  {
    id: 'french-75',
    name: 'French 75',
    category: 'cocktail',
    ingredients: ['Gin', 'Citron', 'Socker', 'Mousserande vin'],
  },
  {
    id: 'lynchburg-lemonade',
    name: 'Lynchburg Lemonade',
    category: 'cocktail',
    ingredients: ["Jack Daniel's", 'Triple Sec', 'Citron', 'Lemonad'],
  },
  {
    id: 'margarita',
    name: 'Margarita',
    category: 'cocktail',
    ingredients: ['Tequila', 'Triple Sec', 'Lime'],
  },
  {
    id: 'whiskey-sour',
    name: 'Whiskey Sour',
    category: 'cocktail',
    ingredients: ['Whiskey', 'Citron', 'Socker'],
  },
  {
    id: 'aperol-spritz',
    name: 'Aperol Spritz',
    category: 'cocktail',
    ingredients: ['Aperol', 'Mousserande vin', 'Sodavatten'],
  },
  {
    id: 'kombucha-mojito',
    name: 'Kombucha Mojito',
    category: 'mocktail',
    ingredients: ['Lime', 'Mynta', 'Socker', 'Krossad is', 'Kombucha'],
  },
  {
    id: 'sparkling-rhubarb',
    name: 'Sparkling Rhubarb',
    category: 'mocktail',
    ingredients: ['Rabarbersaft', 'Citronjuice', 'Mousserande'],
  },
  {
    id: 'aperol-spritz-0',
    name: 'Aperol Spritz 0%',
    category: 'mocktail',
    ingredients: ['Blodgrape-/Apelsinjuice', 'Ginger Ale', 'Tonic'],
  },
  {
    id: 'house-white',
    name: 'Husets vita vin',
    category: 'wine',
    ingredients: [],
  },
  {
    id: 'house-rose',
    name: 'Husets rosévin',
    category: 'wine',
    ingredients: [],
  },
  {
    id: 'house-red',
    name: 'Husets röda vin',
    category: 'wine',
    ingredients: [],
  },
  {
    id: 'sparkling-wine',
    name: 'Mousserande vin',
    category: 'wine',
    ingredients: [],
  },
  { id: 'peroni', name: 'Peroni', category: 'beer', ingredients: [] },
  {
    id: 'peroni-0',
    name: 'Peroni alkoholfri',
    category: 'beer',
    ingredients: [],
  },
  { id: 'whiskey', name: 'Whiskey', category: 'digestif', ingredients: [] },
  { id: 'cognac', name: 'Konjak', category: 'digestif', ingredients: [] },
  {
    id: 'kaffe-karlsson',
    name: 'Kaffe Karlsson',
    category: 'digestif',
    ingredients: [],
  },
  {
    id: 'irish-coffee',
    name: 'Irish Coffee',
    category: 'digestif',
    ingredients: [],
  },
  { id: 'baileys', name: "Bailey's", category: 'digestif', ingredients: [] },
]

const config = eventConfigSchema.parse({ name: 'The wedding', tableCount: 8 })

const staff = {
  email: process.env.DEMO_STAFF_EMAIL ?? 'bar@demo.test',
  password: process.env.DEMO_STAFF_PASSWORD ?? 'demo-bar-1234',
  displayName: 'Bar staff',
}

initializeApp({
  projectId: process.env.GCLOUD_PROJECT ?? 'demo-wedding-drinks',
})
const db = getFirestore()
const auth = getAuth()

const batch = db.batch()
batch.set(db.doc('config/event'), config)
menu.forEach((item, index) => {
  const { id, ...drink } = drinkSchema.parse({
    ...item,
    available: true,
    sortOrder: index,
  })
  batch.set(db.doc(`drinks/${id}`), drink)
})
await batch.commit()

const user = await auth.getUserByEmail(staff.email).catch(() =>
  auth.createUser({
    email: staff.email,
    password: staff.password,
    displayName: staff.displayName,
  }),
)
await db.doc(`staff/${user.uid}`).set({ displayName: staff.displayName })

console.log(
  `Seeded ${menu.length} drinks, config/event and the staff account ${staff.email}.`,
)
