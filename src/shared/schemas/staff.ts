import { z } from 'zod'

/** staff/{uid}. A user is staff because this document exists. */
export const staffSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
})
export type Staff = z.infer<typeof staffSchema>
