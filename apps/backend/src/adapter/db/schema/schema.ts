import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { bytea } from '@/lib/drizzle.ts'

export const timeEntries = pgTable('time_entries', {
  id: varchar().primaryKey(),
  createdAt: bytea().notNull(),
  updatedAt: bytea().notNull(),
  lookupKey: integer().notNull(),
  startedAt: bytea().notNull(),
  endedAt: bytea(),
  message: bytea().notNull(),
})

export const users = pgTable('users', {
  id: varchar().primaryKey(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
  username: varchar().notNull().unique(),
  salt: varchar().notNull(),
  verifier: varchar().notNull(),
})
