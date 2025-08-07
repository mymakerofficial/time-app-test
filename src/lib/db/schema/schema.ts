import { customType, integer, pgTable, varchar } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { any, string } from 'zod'
import { ab2str, str2ab, str2Uint8Array, Uint8Array2str } from '@/lib/crypt.ts'

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

const ab2strType = any().transform((it) => typeof it === "string" ? it : ab2str(it))

export const timeEntriesSelectSchema = createSelectSchema(timeEntries, {
  createdAt: ab2strType,
  updatedAt: ab2strType,
  startedAt: ab2strType,
  endedAt: ab2strType.nullable(),
  message: ab2strType,
})
export const timeEntriesInsertSchema = createInsertSchema(timeEntries, {
  createdAt: string().transform(str2Uint8Array),
  updatedAt: string().transform(str2Uint8Array),
  startedAt: string().transform(str2Uint8Array),
  endedAt: string()
    .transform(str2Uint8Array)
    .nullable(),
  message: string().transform(str2Uint8Array),
})