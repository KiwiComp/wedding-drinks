import type { FirestoreDataConverter } from 'firebase/firestore'
import type { z } from 'zod'

/**
 * Validates every document that is read, and adds the document id as the field id.
 * Writes go through the functions in api.ts, without a converter.
 */
export function readConverter<T>(
  schema: z.ZodType<T>,
): FirestoreDataConverter<T> {
  return {
    toFirestore() {
      throw new Error(
        'Write without withConverter. Writes are validated in api.ts.',
      )
    },
    fromFirestore(snapshot, options) {
      return schema.parse({
        id: snapshot.id,
        ...snapshot.data({ ...options, serverTimestamps: 'estimate' }),
      })
    },
  }
}
