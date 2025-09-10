import { jsonb, pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { nanoid } from 'nanoid'
import { UserAuthenticatorDto } from '@time-app-test/shared/model/domain/auth/authenticator.ts'
import { bytea } from '@/lib/drizzle'

export const users = pgTable('users', {
  id: varchar().primaryKey(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  username: varchar().notNull().unique(),
})

export const authMethodEnum = pgEnum('auth_method', ['SRP', 'PASSKEY'])
export const userAuthenticators = pgTable('user_authenticators', {
  id: varchar()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: varchar().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  method: authMethodEnum().notNull(),
  data: jsonb().$type<UserAuthenticatorDto>().notNull(),
  kekSalt: varchar().notNull(),
  dek: varchar().notNull(),
})

export const notes = pgTable('notes', {
  id: varchar().primaryKey(),
  userId: varchar()
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: varchar().notNull(),
  updatedAt: varchar().notNull(),
  message: varchar().notNull(),
})

export const attachments = pgTable('attachments', {
  id: varchar().primaryKey(),
  noteId: varchar()
    .references(() => notes.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: varchar().notNull(),
  updatedAt: varchar().notNull(),
  filename: varchar().notNull(),
  mimeType: varchar().notNull(),
  content: bytea().notNull(),
})
