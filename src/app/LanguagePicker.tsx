import { useId } from 'react'
import { isLocale, LOCALE_NAMES, LOCALES } from '@/shared/i18n/locale'
import { useI18n } from '@/shared/i18n/useStrings'

export function LanguagePicker() {
  const { locale, strings: t, setLocale } = useI18n()
  const id = useId()

  return (
    <div className="flex items-center gap-2 text-sm">
      <label htmlFor={id}>{t.common.languageLabel}</label>
      <select
        id={id}
        value={locale}
        onChange={(event) => {
          if (isLocale(event.target.value)) setLocale(event.target.value)
        }}
        className="rounded-md border border-input bg-background px-2 py-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {LOCALES.map((option) => (
          <option key={option} value={option} lang={option}>
            {LOCALE_NAMES[option]}
          </option>
        ))}
      </select>
    </div>
  )
}
