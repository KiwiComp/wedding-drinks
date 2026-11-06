import { renderHook, waitFor } from '@testing-library/react'
import { signInAnonymously, type UserCredential } from 'firebase/auth'
import { StrictMode, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGuestSession } from '@/features/ordering/hooks'
import { AuthContext, type AuthState } from '@/shared/auth/AuthContext'

vi.mock('@/shared/firebase/app', () => ({ auth: {} }))
vi.mock('firebase/auth', () => ({ signInAnonymously: vi.fn() }))

function renderSession(authState: AuthState) {
  return renderHook(useGuestSession, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <StrictMode>
        <AuthContext value={authState}>{children}</AuthContext>
      </StrictMode>
    ),
  })
}

describe('useGuestSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(signInAnonymously).mockResolvedValue({} as UserCredential)
  })

  it('signs in once when signed out, also in StrictMode', () => {
    const { result } = renderSession({ status: 'signedOut' })

    expect(signInAnonymously).toHaveBeenCalledOnce()
    expect(result.current).toEqual({ status: 'loading' })
  })

  it('waits while the auth state loads', () => {
    const { result } = renderSession({ status: 'loading' })

    expect(signInAnonymously).not.toHaveBeenCalled()
    expect(result.current).toEqual({ status: 'loading' })
  })

  it('gives the uid without signing in when already signed in', () => {
    const { result } = renderSession({
      status: 'signedIn',
      uid: 'guest-1',
      isAnonymous: true,
    })

    expect(signInAnonymously).not.toHaveBeenCalled()
    expect(result.current).toEqual({ status: 'success', data: 'guest-1' })
  })

  it('gives the error when the sign-in fails', async () => {
    const error = new Error('boom')
    vi.mocked(signInAnonymously).mockRejectedValue(error)

    const { result } = renderSession({ status: 'signedOut' })

    await waitFor(() =>
      expect(result.current).toEqual({ status: 'error', error }),
    )
  })
})
