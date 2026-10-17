import { connectAuthEmulator } from 'firebase/auth'
import { connectFirestoreEmulator } from 'firebase/firestore'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({})) }))
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  connectAuthEmulator: vi.fn(),
}))
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  connectFirestoreEmulator: vi.fn(),
}))

describe('firebase app', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('connects to the emulators when VITE_USE_EMULATORS is true', async () => {
    vi.stubEnv('VITE_USE_EMULATORS', 'true')

    await import('@/shared/firebase/app')

    expect(connectFirestoreEmulator).toHaveBeenCalledWith(
      expect.anything(),
      '127.0.0.1',
      8080,
    )
    expect(connectAuthEmulator).toHaveBeenCalledWith(
      expect.anything(),
      'http://127.0.0.1:9099',
      { disableWarnings: true },
    )
  })

  it('does not connect to the emulators otherwise', async () => {
    vi.stubEnv('VITE_USE_EMULATORS', 'false')

    await import('@/shared/firebase/app')

    expect(connectFirestoreEmulator).not.toHaveBeenCalled()
    expect(connectAuthEmulator).not.toHaveBeenCalled()
  })
})
