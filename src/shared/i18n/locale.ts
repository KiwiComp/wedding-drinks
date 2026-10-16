export const LOCALES = ['en', 'sv'] as const
export type Locale = (typeof LOCALES)[number]

/** Each language is named in its own language. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  sv: 'Svenska',
}

const STORAGE_KEY = 'locale'

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((locale) => locale === value)
}

export function initialLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLocale(saved)) return saved
  } catch {
    // Storage can be blocked, for example in private browsing.
  }
  return navigator.language.toLowerCase().startsWith('sv') ? 'sv' : 'en'
}

export function saveLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // The choice then only lasts for this visit.
  }
}
