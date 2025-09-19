import type { SQLWrapper } from 'drizzle-orm/sql/sql'
import { Readable } from 'node:stream'
import { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres'
import { ExtractTablesWithRelations } from 'drizzle-orm'
import { Pool } from 'pg'
import { PgliteDatabase, PgliteTransaction } from 'drizzle-orm/pglite'
import { PGlite } from '@electric-sql/pglite'
import { NodePgClient } from 'drizzle-orm/node-postgres/session'

export type UniversalPgClient = NodePgClient | PGlite

export type UniversalPgDatabase<
  TSchema extends Record<string, unknown> = Record<string, never>,
> =
  | (NodePgDatabase<TSchema> & {
      $client: Pool
    })
  | (PgliteDatabase<TSchema> & {
      $client: PGlite
    })

export type UniversalPgTransaction<
  TSchema extends Record<string, unknown> = Record<string, never>,
> =
  | NodePgTransaction<TSchema, ExtractTablesWithRelations<TSchema>>
  | PgliteTransaction<TSchema, ExtractTablesWithRelations<TSchema>>

export type DatabaseOrTransaction<
  TSchema extends Record<string, unknown> = Record<string, never>,
> = UniversalPgDatabase<TSchema> | UniversalPgTransaction<TSchema>

export interface DatabaseExtensionBase<
  TSchema extends Record<string, unknown> = Record<string, never>,
> {
  queryStream: <T extends SQLWrapper>(query: T) => Readable
  createTransaction: () => Promise<ExtendedTransaction<TSchema>>
}

export type DrizzleWithExtension<
  TSchema extends Record<string, unknown>,
  TBase extends DatabaseOrTransaction<TSchema>,
> = TBase & DatabaseExtensionBase<TSchema>

export type ExtendedDatabase<
  TSchema extends Record<string, unknown> = Record<string, never>,
> = DrizzleWithExtension<TSchema, UniversalPgDatabase<TSchema>>

export interface ManualTransactionBase {
  rollback: () => Promise<void>
  commit: () => Promise<void>
}

export type ExtendedTransaction<
  TSchema extends Record<string, unknown> = Record<string, never>,
> = Omit<
  DrizzleWithExtension<TSchema, UniversalPgTransaction<TSchema>>,
  'rollback'
> &
  ManualTransactionBase

export type ExtendedDatabaseOrTransaction<
  TSchema extends Record<string, unknown> = Record<string, never>,
> = ExtendedDatabase<TSchema> | ExtendedTransaction<TSchema>
