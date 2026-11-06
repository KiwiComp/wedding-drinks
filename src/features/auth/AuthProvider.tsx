import { onAuthStateChanged } from 'firebase/auth'
import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext, type AuthState } from '@/shared/auth/AuthContext'
import { auth } from '@/shared/firebase/app'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ status: 'loading' })

  useEffect(
    () =>
      onAuthStateChanged(auth, (user) =>
        setAuthState(
          user
            ? {
                status: 'signedIn',
                uid: user.uid,
                isAnonymous: user.isAnonymous,
              }
            : { status: 'signedOut' },
        ),
      ),
    [],
  )

  return <AuthContext value={authState}>{children}</AuthContext>
}
