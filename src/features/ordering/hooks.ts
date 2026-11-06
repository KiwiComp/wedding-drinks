import { signInAnonymously } from 'firebase/auth'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/shared/auth/useAuth'
import { auth } from '@/shared/firebase/app'
import type { QueryState } from '@/shared/firebase/useLiveQuery'

/** Signs the guest in anonymously when needed, and gives the uid of the signed-in user. */
export function useGuestSession(): QueryState<string> {
  const authState = useAuth()
  const [error, setError] = useState<Error | null>(null)
  // StrictMode runs the effect twice, and two calls would create two anonymous users.
  const signingIn = useRef(false)

  useEffect(() => {
    if (authState.status !== 'signedOut' || signingIn.current) return

    signingIn.current = true
    signInAnonymously(auth)
      .catch((reason: Error) => setError(reason))
      .finally(() => {
        signingIn.current = false
      })
  }, [authState.status])

  if (error) return { status: 'error', error }
  return authState.status === 'signedIn'
    ? { status: 'success', data: authState.uid }
    : { status: 'loading' }
}
