import {
  DatabaseOrTransaction,
  DrizzleWithExtension,
  UniversalPgClient,
} from '@/lib/drizzle/types.ts'
import type { DrizzleConfig } from 'drizzle-orm/utils'
import { DrizzleQueryStreamFactoryFactory } from '@/lib/drizzle/queryStream.ts'
import { PgDialect } from 'drizzle-orm/pg-core'
import { DrizzleTransactionFactory } from '@/lib/drizzle/transaction.ts'

export function extendedDrizzleFactory<
  TSchema extends Record<string, unknown>,
  TBase extends DatabaseOrTransaction<TSchema>,
>(
  base: TBase,
  client: UniversalPgClient,
  config: DrizzleConfig<TSchema>,
): DrizzleWithExtension<TBase, TSchema> {
  const queryStream = DrizzleQueryStreamFactoryFactory.create(
    client,
    new PgDialect({
      casing: config.casing,
    }),
  )

  const manualTransaction = new DrizzleTransactionFactory<TSchema>(base, config)

  return Object.assign(base, {
    queryStream: queryStream.execute.bind(queryStream),
    createTransaction: manualTransaction.execute.bind(manualTransaction),
  })
}
