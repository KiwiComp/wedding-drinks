import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { App } from '@/app/App'

vi.mock('@/shared/firebase/hooks', () => ({
  useEventConfig: () => ({ status: 'loading' }),
}))
// Vitest does not load .env.development, and getAuth throws without an API key.
vi.mock('@/shared/firebase/app', () => ({ auth: {} }))
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(() => () => {}),
  signInAnonymously: vi.fn(),
}))

describe('App', () => {
  it('renders the main landmark', () => {
    render(<App />)

    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
