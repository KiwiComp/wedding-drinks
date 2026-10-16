import { afterEach, describe, expect, it, vi } from 'vitest'
import { initialLocale } from '@/shared/i18n/locale'

describe('initialLocale', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it.each([
    ['sv-SE', 'sv'],
    ['sv', 'sv'],
    ['en-US', 'en'],
    ['de-DE', 'en'],
  ])('returns %s as %s', (language, expected) => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue(language)

    expect(initialLocale()).toBe(expected)
  })
})
