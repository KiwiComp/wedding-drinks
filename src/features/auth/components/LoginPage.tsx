import { useStrings } from '@/shared/i18n/useStrings'

export function LoginPage() {
  const t = useStrings()

  return <h1>{t.common.appName}</h1>
}
