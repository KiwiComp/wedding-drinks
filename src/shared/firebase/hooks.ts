import { eventConfigRef } from '@/shared/firebase/refs'
import { useLiveDoc, type QueryState } from '@/shared/firebase/useLiveQuery'
import type { EventConfig } from '@/shared/schemas/eventConfig'

export const useEventConfig = (): QueryState<EventConfig> =>
  useLiveDoc(eventConfigRef)
