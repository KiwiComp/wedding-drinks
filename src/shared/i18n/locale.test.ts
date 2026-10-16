import { afterEach, describe, expect, it, vi } from 'vitest'
import { initialLocale, saveLocale } from '@/shared/i18n/locale'

describe('initialLocale', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
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

  it('prefers a saved locale over the browser language', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-US')
    saveLocale('sv')

    expect(initialLocale()).toBe('sv')
  })

  it('ignores an invalid saved value', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('sv-SE')
    localStorage.setItem('locale', 'de')

    expect(initialLocale()).toBe('sv')
  })

  it('falls back to the browser language when storage is blocked', () => {
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('sv-SE')
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(initialLocale()).toBe('sv')
  })
})

describe('saveLocale', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('saves the locale', () => {
    saveLocale('sv')

    expect(localStorage.getItem('locale')).toBe('sv')
  })

  it('does not throw when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(() => saveLocale('sv')).not.toThrow()
  })
})
