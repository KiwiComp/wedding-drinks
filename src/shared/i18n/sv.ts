import type { Strings } from '@/shared/i18n/en'

export const sv: Strings = {
  common: {
    appName: 'Wedding Drinks',
    loading: 'Laddar…',
    cancel: 'Avbryt',
    close: 'Stäng',
    reload: 'Ladda om',
    errorTitle: 'Något gick fel',
    languageLabel: 'Språk',
    table: (table: number) => `Bord ${table}`,
  },
  notFound: {
    title: 'Sidan finns inte',
    unknownTable:
      'Vi hittar inte det bordet. Skanna QR-koden på ditt bord igen.',
  },
}
