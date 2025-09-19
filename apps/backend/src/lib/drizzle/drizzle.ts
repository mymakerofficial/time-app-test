import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import type { DrizzleConfig } from 'drizzle-orm/utils'
import { DrizzleQueryStreamFactory } from '@/lib/drizzle/queryStream.ts'
import { PgDialect } from 'drizzle-orm/pg-core'
import {
  DatabaseOrTransaction,
  DrizzleWithExtension,
  ExtendedDrizzle,
} from '@/lib/drizzle/types.ts'
import { DrizzleTransactionFactory } from '@/lib/drizzle/transaction.ts'
import { NodePgClient } from 'drizzle-orm/node-postgres/session'

export function extendedDrizzleFactory<
  TSchema extends Record<string, unknown>,
  T extends
    | DatabaseOrTransaction
    | DrizzleWithExtension<DatabaseOrTransaction, TSchema>,
>(base: T, client: NodePgClient, config: DrizzleConfig<TSchema>) {
  const queryStream = new DrizzleQueryStreamFactory(
    client,
    new PgDialect({
      casing: config.casing,
    }),
  )

  const manualTransaction = new DrizzleTransactionFactory(base, config)

  return Object.assign(base, {
    queryStream: queryStream.execute.bind(queryStream),
    manualTransaction: manualTransaction.execute.bind(manualTransaction),
  })
}

export function drizzle<
  TSchema extends Record<string, unknown> = Record<string, never>,
>(
  config: DrizzleConfig<TSchema> & {
    client: Pool
  },
): ExtendedDrizzle<TSchema> {
  const base = drizzleNode(config)
  return extendedDrizzleFactory(base, base.$client, config)
}
