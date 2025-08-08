import { customType, integer, pgTable, varchar } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import z from 'zod'

const bytea = customType<{ data: Uint8Array }>({
  dataType() {
    return 'bytea'
  },
})

export const timeEntries = pgTable('time_entries', {
  id: varchar().primaryKey(),
  createdAt: bytea().notNull(),
  updatedAt: bytea().notNull(),
  lookupKey: integer().notNull(),
  startedAt: bytea().notNull(),
  endedAt: bytea(),
  message: bytea().notNull(),
})

export const TimeEntriesSelectSchema = createSelectSchema(timeEntries, {
  createdAt: z.instanceof(Uint8Array),
  updatedAt: z.instanceof(Uint8Array),
  startedAt: z.instanceof(Uint8Array),
  endedAt: z.instanceof(Uint8Array).nullable(),
  message: z.instanceof(Uint8Array),
})
export type TimeEntriesSelect = z.infer<typeof TimeEntriesSelectSchema>

export const TimeEntriesInsertSchema = createInsertSchema(timeEntries, {
  createdAt: z.instanceof(Uint8Array),
  updatedAt: z.instanceof(Uint8Array),
  startedAt: z.instanceof(Uint8Array),
  endedAt: z.instanceof(Uint8Array).nullable(),
  message: z.instanceof(Uint8Array),
})
export type TimeEntriesInsert = z.infer<typeof TimeEntriesInsertSchema>