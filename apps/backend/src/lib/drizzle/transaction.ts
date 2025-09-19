import { NodePgDatabase, NodePgTransaction } from 'drizzle-orm/node-postgres'
import {
  DatabaseOrTransaction,
  DrizzleManualTransaction,
  DrizzleManualTransactionBase,
} from '@/lib/drizzle/types.ts'
import { ExtractTablesWithRelations } from 'drizzle-orm'
import { NodePgClient } from 'drizzle-orm/node-postgres/session'
import type { DrizzleConfig } from 'drizzle-orm/utils'
import { extendedDrizzleFactory } from '@/lib/drizzle/drizzle.ts'

export class DrizzleTransactionFactory<
  TSchema extends Record<string, unknown>,
> {
  constructor(
    private readonly drizzle: DatabaseOrTransaction<TSchema>,
    private readonly config: DrizzleConfig<TSchema>,
  ) {}

  async execute(): Promise<DrizzleManualTransaction> {
    const base = await new Promise<
      DrizzleManualTransactionBase &
        NodePgTransaction<TSchema, ExtractTablesWithRelations<TSchema>>
    >((resolveMt) => {
      const txPromise = this.drizzle.transaction(async (tx) => {
        return new Promise((resolveTx, rejectTx) => {
          resolveMt(
            Object.assign(tx, {
              commit: async () => {
                resolveTx(undefined)
                await txPromise
              },
              rollback: async () => {
                rejectTx()
                await txPromise
              },
            }),
          )
        })
      })
    })

    // client is private
    const client = (base as unknown as { client: NodePgClient }).client

    return extendedDrizzleFactory(base, client, this.config)
  }
}
