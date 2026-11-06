import { useParams } from 'react-router'
import { TableView } from '@/features/ordering/components/TableView'
import { useGuestSession } from '@/features/ordering/hooks'
import { useEventConfig } from '@/shared/firebase/hooks'

export function TablePage() {
  const { tableId } = useParams()
  const config = useEventConfig()
  const session = useGuestSession()

  return <TableView tableId={tableId} config={config} session={session} />
}
