export const en = {
  common: {
    appName: 'Wedding Drinks',
    loading: 'Loading…',
    cancel: 'Cancel',
    close: 'Close',
    reload: 'Reload',
    errorTitle: 'Something went wrong',
    languageLabel: 'Language',
    table: (table: number) => `Table ${table}`,
  },
  notFound: {
    title: 'Page not found',
    unknownTable:
      "We couldn't find that table. Scan the QR code on your table again.",
  },
}

export type Strings = typeof en
