import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { bytea } from '@/lib/drizzle.ts'

export const users = pgTable('users', {
  id: varchar().primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  username: varchar().notNull().unique(),
})

export const userPasswords = pgTable('user_passwords', {
  userId: varchar('user_id')
    .primaryKey()
    .references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  salt: varchar().notNull(),
  verifier: varchar().notNull(),
})

export const timeEntries = pgTable('time_entries', {
  id: varchar().primaryKey(),
  createdAt: bytea('updated_at').notNull(),
  updatedAt: bytea('updated_at').notNull(),
  lookupKey: integer('lookup_key').notNull(),
  startedAt: bytea('updated_at').notNull(),
  endedAt: bytea('ended_at'),
  message: bytea().notNull(),
})
