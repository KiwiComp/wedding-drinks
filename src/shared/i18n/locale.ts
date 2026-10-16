export const LOCALES = ['en', 'sv'] as const
export type Locale = (typeof LOCALES)[number]

/** Each language is named in its own language. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  sv: 'Svenska',
}

export function initialLocale(): Locale {
  return navigator.language.toLowerCase().startsWith('sv') ? 'sv' : 'en'
}
