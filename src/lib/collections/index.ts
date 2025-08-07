import {
  createCollection,
  localOnlyCollectionOptions,
} from '@tanstack/react-db'
import { z } from 'zod'

export const TimeEntrySchema = z.object({
  id: z.nanoid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  syncStatus: z.enum(['synced', 'pending', 'error']),
  lookupKey: z.int().min(-1),
  startedAt: z.date(),
  endedAt: z.date().nullable(),
  message: z.string()
})

export type TimeEntry = z.infer<typeof TimeEntrySchema>

export const timeEntriesCollection = createCollection(
  localOnlyCollectionOptions({
    getKey: (timeEntry) => timeEntry.id,
    schema: TimeEntrySchema,
  }),
)