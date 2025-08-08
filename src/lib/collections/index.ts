import {
  createCollection,
  localOnlyCollectionOptions,
} from '@tanstack/react-db'
import { TimeEntrySchema } from '@/lib/schema/timeEntries.ts'

export const timeEntriesCollection = createCollection(
  localOnlyCollectionOptions({
    getKey: (timeEntry) => timeEntry.id,
    schema: TimeEntrySchema,
  }),
)