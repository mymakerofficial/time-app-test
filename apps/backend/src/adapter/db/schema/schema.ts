import { jsonb, pgEnum, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { nanoid } from 'nanoid'
import { UserAuthenticatorDto } from '@time-app-test/shared/model/domain/auth/authenticator.ts'

export const users = pgTable('users', {
  id: varchar().primaryKey(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
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
  userId: varchar('user_id').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  method: authMethodEnum().notNull(),
  data: jsonb().$type<UserAuthenticatorDto>().notNull(),
  kekSalt: varchar('kek_salt').notNull(),
  dek: varchar().notNull(),
})

export const notes = pgTable('notes', {
  id: varchar().primaryKey(),
  userId: varchar()
    .notNull()
    .references(() => users.id),
  createdAt: varchar('updated_at').notNull(),
  updatedAt: varchar('created_at').notNull(),
  message: varchar().notNull(),
})
