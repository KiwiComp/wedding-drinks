import { useStrings } from '@/shared/i18n/useStrings'

export function NotFoundPage() {
  const t = useStrings()

  return <h1>{t.notFound.title}</h1>
}
