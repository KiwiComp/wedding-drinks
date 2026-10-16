import { createContext } from 'react'
import type { Strings } from '@/shared/i18n/en'
import type { Locale } from '@/shared/i18n/locale'

export type I18n = {
  locale: Locale
  strings: Strings
  setLocale: (locale: Locale) => void
}

export const I18nContext = createContext<I18n | null>(null)
