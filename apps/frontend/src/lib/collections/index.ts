import {
  createCollection,
  localOnlyCollectionOptions,
  localStorageCollectionOptions,
} from '@tanstack/react-db'
import { TimeEntrySchema } from '../schema/timeEntries.ts'
import z from 'zod'

export const timeEntriesCollection = createCollection(
  localStorageCollectionOptions({
    id: 'time-entries',
    storageKey: 'app-time-entries',
    getKey: (timeEntry) => timeEntry.id,
    schema: TimeEntrySchema,
  }),
)

export const notesCollection = createCollection(
  localOnlyCollectionOptions({
    id: 'notes',
    getKey: (note) => note.id,
    schema: z.object({
      id: z.nanoid(),
      createdAt: z.date(),
      updatedAt: z.date(),
      message: z.string(),
    }),
  }),
)
