import { useStrings } from '@/shared/i18n/useStrings'
import { Button } from '@/shared/ui/button'

export function RouteError() {
  const t = useStrings()

  return (
    <div role="alert">
      <h1>{t.common.errorTitle}</h1>
      <Button onClick={() => window.location.reload()}>
        {t.common.reload}
      </Button>
    </div>
  )
}
