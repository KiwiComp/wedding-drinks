import { createContext } from 'react'

export type AuthState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; uid: string; isAnonymous: boolean }

export const AuthContext = createContext<AuthState | null>(null)
