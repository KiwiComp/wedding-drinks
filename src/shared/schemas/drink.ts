import { z } from 'zod'

/** The order here is the order of the category tabs in the guest view. */
export const DRINK_CATEGORIES = [
  'cocktail',
  'mocktail',
  'wine',
  'beer',
  'digestif',
] as const

export const drinkCategorySchema = z.enum(DRINK_CATEGORIES)
export type DrinkCategory = z.infer<typeof drinkCategorySchema>

/** drinks/{drinkId} */
export const drinkSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(60),
  category: drinkCategorySchema,
  ingredients: z.array(z.string().min(1)).max(10),
  available: z.boolean(),
  sortOrder: z.number().int().nonnegative(),
})
export type Drink = z.infer<typeof drinkSchema>
