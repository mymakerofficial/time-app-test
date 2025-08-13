import { PoolClient } from 'pg'
import { PgSelect } from 'drizzle-orm/pg-core'
import QueryStream from 'pg-query-stream'

export function drizzleQueryStream<T extends { toSQL: PgSelect['toSQL'] }>(
  client: PoolClient,
  query: T,
) {
  const sql = query.toSQL()
  return client.query(new QueryStream(sql.sql, sql.params))
}
