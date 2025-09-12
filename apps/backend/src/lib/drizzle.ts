import { customType, PgDialect } from 'drizzle-orm/pg-core'
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres'
import type { NodePgClient } from 'drizzle-orm/node-postgres/session'
import { Pool } from 'pg'
import type { DrizzleConfig } from 'drizzle-orm/utils'
import QueryStream from 'pg-query-stream'
import type { SQLWrapper } from 'drizzle-orm/sql/sql'
import { Readable } from 'node:stream'
import { hexToUint8, uint8ToHex } from '@time-app-test/shared/helper/binary.ts'
import { isString } from '@time-app-test/shared/guards.ts'

export const bytea = customType<{ data: Uint8Array }>({
  dataType() {
    return 'bytea'
  },
})

export const byteaToHex = customType<{ data: string }>({
  dataType() {
    return 'bytea'
  },
  toDriver(value) {
    return hexToUint8(value)
  },
  fromDriver(value) {
    if (isString(value)) return value // assume it's already hex
    return uint8ToHex(value as Uint8Array)
  },
})

const pgDialect = new PgDialect()
function drizzleQueryStream<T extends SQLWrapper>(
  client: Pool,
  query: T,
): Readable {
  const sql = pgDialect.sqlToQuery(query.getSQL())
  return client.query(new QueryStream(sql.sql, sql.params))
}

export function drizzle<
  TSchema extends Record<string, unknown> = Record<string, never>,
  TClient extends NodePgClient = Pool,
>(
  config: DrizzleConfig<TSchema> & {
    client: TClient
  },
) {
  const originalDrizzle = drizzleNode(config)

  return Object.assign(originalDrizzle, {
    queryStream: <T extends SQLWrapper>(query: T) =>
      drizzleQueryStream(originalDrizzle.$client, query),
  })
}
