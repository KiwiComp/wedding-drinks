import { act, render, screen } from '@testing-library/react'
import {
  onAuthStateChanged,
  type NextOrObserver,
  type User,
} from 'firebase/auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { useAuth } from '@/shared/auth/useAuth'

vi.mock('@/shared/firebase/app', () => ({ auth: {} }))
vi.mock('firebase/auth', () => ({ onAuthStateChanged: vi.fn() }))

const unsubscribe = vi.fn()

function Status() {
  return <p>{JSON.stringify(useAuth())}</p>
}

function emit(user: Pick<User, 'uid' | 'isAnonymous'> | null) {
  const listener = vi.mocked(onAuthStateChanged).mock
    .calls[0][1] as NextOrObserver<User> as (user: User | null) => void
  act(() => listener(user as User | null))
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(onAuthStateChanged).mockReturnValue(unsubscribe)
  })

  it('starts as loading', () => {
    render(
      <AuthProvider>
        <Status />
      </AuthProvider>,
    )

    expect(screen.getByText('{"status":"loading"}')).toBeInTheDocument()
  })

  it('is signed out when there is no user', () => {
    render(
      <AuthProvider>
        <Status />
      </AuthProvider>,
    )

    emit(null)

    expect(screen.getByText('{"status":"signedOut"}')).toBeInTheDocument()
  })

  it('gives the uid of a signed-in user', () => {
    render(
      <AuthProvider>
        <Status />
      </AuthProvider>,
    )

    emit({ uid: 'guest-1', isAnonymous: true })

    expect(
      screen.getByText(
        '{"status":"signedIn","uid":"guest-1","isAnonymous":true}',
      ),
    ).toBeInTheDocument()
  })

  it('stops listening when it unmounts', () => {
    const { unmount } = render(
      <AuthProvider>
        <Status />
      </AuthProvider>,
    )

    unmount()

    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('makes useAuth throw outside the provider', () => {
    // React logs the thrown error, which is expected here.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Status />)).toThrow(
      'useAuth must be used inside AuthProvider',
    )
    consoleError.mockRestore()
  })
})
