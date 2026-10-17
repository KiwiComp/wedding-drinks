import { z } from 'zod'

/** config/event */
export const eventConfigSchema = z.object({
  name: z.string().min(1),
  tableCount: z.number().int().min(1).max(50),
})
export type EventConfig = z.infer<typeof eventConfigSchema>

/** Turns :tableId from the URL into a table number, or null if the table does not exist. */
export function parseTableId(
  raw: string | undefined,
  config: EventConfig,
): number | null {
  const table = Number(raw)
  return Number.isInteger(table) && table >= 1 && table <= config.tableCount
    ? table
    : null
}
