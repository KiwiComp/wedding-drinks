import { useStrings } from '@/shared/i18n/useStrings'

export function TablePage() {
  const t = useStrings()

  return <h1>{t.common.appName}</h1>
}
