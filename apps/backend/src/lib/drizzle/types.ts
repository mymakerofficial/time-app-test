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

export interface DrizzleExtension<
  TSchema extends Record<string, unknown> = Record<string, never>,
> {
  queryStream: <T extends SQLWrapper>(query: T) => Readable
  createTransaction: () => Promise<ExtendedDrizzleTransaction<TSchema>>
}

export type DrizzleWithExtension<
  TBase extends object,
  TSchema extends Record<string, unknown> = Record<string, never>,
> = TBase & DrizzleExtension<TSchema>

export type ExtendedDrizzle<
  TSchema extends Record<string, unknown> = Record<string, never>,
> = DrizzleWithExtension<UniversalPgDatabase<TSchema>, TSchema>

export interface DrizzleManualTransactionBase {
  rollback: () => Promise<void>
  commit: () => Promise<void>
}

export type ExtendedDrizzleTransaction<
  TSchema extends Record<string, unknown> = Record<string, never>,
> = Omit<
  DrizzleWithExtension<UniversalPgTransaction<TSchema>, TSchema>,
  'rollback'
> &
  DrizzleManualTransactionBase
