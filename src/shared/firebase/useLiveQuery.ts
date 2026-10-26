import { useEffect, useState } from 'react'
import {
  onSnapshot,
  type DocumentReference,
  type Query,
} from 'firebase/firestore'

export type QueryState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T }

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error))

/**
 * Subscribes to a query while the component is mounted. The result is stored with its query,
 * so that a new query shows loading at once instead of old data.
 * An invalid document is skipped and logged, so that it cannot stop the whole list.
 * The query must be stable: a module constant or created with useMemo.
 */
export function useLiveQuery<T>(query: Query<T>): QueryState<T[]> {
  const [result, setResult] = useState<{
    query: Query<T>
    state: QueryState<T[]>
  } | null>(null)

  useEffect(
    () =>
      onSnapshot(
        query,
        (snapshot) => {
          const data = snapshot.docs.flatMap((doc) => {
            try {
              return [doc.data()]
            } catch (error) {
              console.error(`Skipped invalid document: ${doc.ref.path}`, error)
              return []
            }
          })
          setResult({ query, state: { status: 'success', data } })
        },
        (error) => setResult({ query, state: { status: 'error', error } }),
      ),
    [query],
  )

  return result?.query === query ? result.state : { status: 'loading' }
}

/** The same for a single document. A missing document counts as an error. */
export function useLiveDoc<T>(ref: DocumentReference<T>): QueryState<T> {
  const [result, setResult] = useState<{
    ref: DocumentReference<T>
    state: QueryState<T>
  } | null>(null)

  useEffect(
    () =>
      onSnapshot(
        ref,
        (snapshot) => {
          try {
            const data = snapshot.data()
            setResult({
              ref,
              state:
                data === undefined
                  ? {
                      status: 'error',
                      error: new Error(`Document ${ref.path} is missing`),
                    }
                  : { status: 'success', data },
            })
          } catch (error) {
            setResult({
              ref,
              state: { status: 'error', error: toError(error) },
            })
          }
        },
        (error) => setResult({ ref, state: { status: 'error', error } }),
      ),
    [ref],
  )

  return result?.ref === ref ? result.state : { status: 'loading' }
}
