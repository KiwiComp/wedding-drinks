import type { QueryState } from '@/shared/firebase/useLiveQuery'
import { useStrings } from '@/shared/i18n/useStrings'
import { parseTableId, type EventConfig } from '@/shared/schemas/eventConfig'
import { NotFoundPage } from '@/shared/ui/NotFoundPage'

type TableViewProps = {
  tableId: string | undefined
  config: QueryState<EventConfig>
  session: QueryState<string>
}

export function TableView({ tableId, config, session }: TableViewProps) {
  const t = useStrings()

  if (config.status === 'loading') {
    return <p role="status">{t.common.loading}</p>
  }
  // Caught by the route's errorElement, which shows RouteError.
  if (config.status === 'error') throw config.error

  const table = parseTableId(tableId, config.data)
  if (table === null) {
    return <NotFoundPage message={t.notFound.unknownTable} />
  }

  if (session.status === 'loading') {
    return <p role="status">{t.common.loading}</p>
  }
  if (session.status === 'error') throw session.error

  return (
    <>
      <h1>{t.common.appName}</h1>
      <p>{t.common.table(table)}</p>
    </>
  )
}
