import {
  DatabaseOrTransaction,
  DrizzleManualTransactionBase,
  ExtendedDrizzleTransaction,
  UniversalPgTransaction,
} from '@/lib/drizzle/types.ts'
import { NodePgClient } from 'drizzle-orm/node-postgres/session'
import type { DrizzleConfig } from 'drizzle-orm/utils'

import { extendedDrizzleFactory } from '@/lib/drizzle/extension.ts'

export class DrizzleTransactionFactory<
  TSchema extends Record<string, unknown> = Record<string, never>,
> {
  constructor(
    private readonly drizzle: DatabaseOrTransaction<TSchema>,
    private readonly config: DrizzleConfig<TSchema>,
  ) {}

  async execute(): Promise<ExtendedDrizzleTransaction<TSchema>> {
    const base = await new Promise<
      DrizzleManualTransactionBase & UniversalPgTransaction<TSchema>
    >((resolveOuter) => {
      // we need to await this promise later to make sure all is done
      const txPromise = this.drizzle
        .transaction(async (tx) => {
          return new Promise((resolveTx, rejectTx) => {
            // resolve the combined object to the outer promise to return it
            resolveOuter(
              Object.assign(tx, {
                commit: async () => {
                  // resolving the callback promise causes drizzle to commit
                  resolveTx(undefined)
                  // wait for the transaction to resolve, at which point COMMIT should've been executed
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
        .catch(() => {
          // rolling back, throws... just ignore it
        })
    })

    // client is private
    const client = (base as unknown as { client: NodePgClient }).client

    return extendedDrizzleFactory(base, client, this.config)
  }
}
