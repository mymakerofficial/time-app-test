import {
  createCollection,
  localStorageCollectionOptions,
} from '@tanstack/react-db'
import { TimeEntrySchema } from '../schema/timeEntries.ts'

export const timeEntriesCollection = createCollection(
  localStorageCollectionOptions({
    id: 'time-entries',
    storageKey: 'app-time-entries',
    getKey: (timeEntry) => timeEntry.id,
    schema: TimeEntrySchema,
  }),
)
