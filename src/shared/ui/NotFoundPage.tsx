import { useStrings } from '@/shared/i18n/useStrings'

export function NotFoundPage({ message }: { message?: string }) {
  const t = useStrings()

  return (
    <>
      <h1>{t.notFound.title}</h1>
      {message && <p>{message}</p>}
    </>
  )
}
