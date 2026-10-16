import { useState, type ReactNode } from 'react'
import { en, type Strings } from '@/shared/i18n/en'
import { I18nContext } from '@/shared/i18n/I18nContext'
import { initialLocale, type Locale } from '@/shared/i18n/locale'
import { sv } from '@/shared/i18n/sv'

const dictionaries: Record<Locale, Strings> = { en, sv }

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale)

  return (
    <I18nContext value={{ locale, strings: dictionaries[locale], setLocale }}>
      {children}
    </I18nContext>
  )
}
