import { useParams } from 'react-router'
import { TableView } from '@/features/ordering/components/TableView'
import { useEventConfig } from '@/shared/firebase/hooks'

export function TablePage() {
  const { tableId } = useParams()
  const config = useEventConfig()

  return <TableView tableId={tableId} config={config} />
}
