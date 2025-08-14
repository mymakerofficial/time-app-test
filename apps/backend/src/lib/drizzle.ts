import { customType, PgSelect } from 'drizzle-orm/pg-core'
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres'
import type { NodePgClient } from 'drizzle-orm/node-postgres/session'
import { Pool } from 'pg'
import type { DrizzleConfig } from 'drizzle-orm/utils'
import QueryStream from 'pg-query-stream'

export const bytea = customType<{ data: Uint8Array }>({
  dataType() {
    return 'bytea'
  },
})

function drizzleQueryStream<T extends { toSQL: PgSelect['toSQL'] }>(
  client: Pool,
  query: T,
) {
  const sql = query.toSQL()
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
    queryStream: <T extends { toSQL: PgSelect['toSQL'] }>(query: T) =>
      drizzleQueryStream(originalDrizzle.$client, query),
  })
}
