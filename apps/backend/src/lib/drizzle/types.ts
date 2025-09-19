import type { SQLWrapper } from 'drizzle-orm/sql/sql'
import { Readable } from 'node:stream'
import { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres'
import { ExtractTablesWithRelations } from 'drizzle-orm'
import { Pool } from 'pg'

export type DatabaseOrTransaction<
  TSchema extends Record<string, unknown> = Record<string, never>,
> =
  | (NodePgDatabase<TSchema> & {
      $client: Pool
    })
  | NodePgTransaction<TSchema, ExtractTablesWithRelations<TSchema>>

export type DrizzleWithExtension<
  T extends object,
  TSchema extends Record<string, unknown> = Record<string, never>,
> = T & {
  queryStream: <T extends SQLWrapper>(query: T) => Readable
  manualTransaction: () => Promise<DrizzleManualTransaction<TSchema>>
}

export type ExtendedDrizzle<
  TSchema extends Record<string, unknown> = Record<string, never>,
> = DrizzleWithExtension<
  NodePgDatabase<TSchema> & {
    $client: Pool
  },
  TSchema
>

export type ExtendedDrizzleTransaction<
  TSchema extends Record<string, unknown> = Record<string, never>,
> = DrizzleWithExtension<
  NodePgTransaction<TSchema, ExtractTablesWithRelations<TSchema>>,
  TSchema
>

export interface DrizzleManualTransactionBase {
  rollback: () => Promise<void>
  commit: () => Promise<void>
}

export type DrizzleManualTransaction<
  TSchema extends Record<string, unknown> = Record<string, never>,
> = ExtendedDrizzleTransaction<TSchema> & DrizzleManualTransactionBase
