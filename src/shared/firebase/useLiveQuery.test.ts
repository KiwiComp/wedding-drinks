import { act, renderHook } from '@testing-library/react'
import {
  onSnapshot,
  type DocumentReference,
  type Query,
} from 'firebase/firestore'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useLiveDoc, useLiveQuery } from '@/shared/firebase/useLiveQuery'

vi.mock('firebase/firestore', () => ({ onSnapshot: vi.fn() }))

type Listener = { next: (snapshot: unknown) => void; error: (e: Error) => void }

let listeners: Listener[]
const unsubscribe = vi.fn()

beforeEach(() => {
  listeners = []
  vi.clearAllMocks()
  vi.mocked(onSnapshot).mockImplementation(((
    _target: unknown,
    next: Listener['next'],
    error: Listener['error'],
  ) => {
    listeners.push({ next, error })
    return unsubscribe
  }) as never)
})

const emit = (snapshot: unknown) => act(() => listeners.at(-1)?.next(snapshot))
const fail = (error: Error) => act(() => listeners.at(-1)?.error(error))

const fakeQuery = () => ({}) as Query<string>
const query = fakeQuery()
const queryDoc = (path: string, data: () => string) => ({ ref: { path }, data })
const invalid = () => {
  throw new Error('invalid')
}

describe('useLiveQuery', () => {
  it('shows loading until the first snapshot, then the data', () => {
    const { result } = renderHook(() => useLiveQuery(query))
    expect(result.current).toEqual({ status: 'loading' })

    emit({ docs: [queryDoc('drinks/a', () => 'a')] })

    expect(result.current).toEqual({ status: 'success', data: ['a'] })
  })

  it('skips and logs an invalid document', () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { result } = renderHook(() => useLiveQuery(query))

    emit({
      docs: [queryDoc('drinks/a', () => 'a'), queryDoc('drinks/b', invalid)],
    })

    expect(result.current).toEqual({ status: 'success', data: ['a'] })
    expect(log).toHaveBeenCalledWith(
      'Skipped invalid document: drinks/b',
      expect.any(Error),
    )
    log.mockRestore()
  })

  it('shows the error when the subscription fails', () => {
    const { result } = renderHook(() => useLiveQuery(query))
    const error = new Error('permission-denied')

    fail(error)

    expect(result.current).toEqual({ status: 'error', error })
  })

  it('shows loading at once for a new query', () => {
    const { result, rerender } = renderHook(({ q }) => useLiveQuery(q), {
      initialProps: { q: fakeQuery() },
    })
    emit({ docs: [queryDoc('drinks/a', () => 'a')] })

    rerender({ q: fakeQuery() })

    expect(result.current).toEqual({ status: 'loading' })
  })

  it('unsubscribes on unmount', () => {
    const { unmount } = renderHook(() => useLiveQuery(query))

    unmount()

    expect(unsubscribe).toHaveBeenCalledOnce()
  })
})

describe('useLiveDoc', () => {
  const ref = { path: 'config/event' } as DocumentReference<string>

  it('shows the document', () => {
    const { result } = renderHook(() => useLiveDoc(ref))
    expect(result.current).toEqual({ status: 'loading' })

    emit({ data: () => 'event' })

    expect(result.current).toEqual({ status: 'success', data: 'event' })
  })

  it('shows an error when the document is missing', () => {
    const { result } = renderHook(() => useLiveDoc(ref))

    emit({ data: () => undefined })

    expect(result.current).toEqual({
      status: 'error',
      error: new Error('Document config/event is missing'),
    })
  })

  it('shows an error when the document is invalid', () => {
    const { result } = renderHook(() => useLiveDoc(ref))

    emit({ data: invalid })

    expect(result.current).toEqual({
      status: 'error',
      error: new Error('invalid'),
    })
  })
})
