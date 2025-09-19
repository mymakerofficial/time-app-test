import type { SQLWrapper } from 'drizzle-orm/sql/sql'
import { Readable } from 'node:stream'
import { PgDialect } from 'drizzle-orm/pg-core'
import QueryStream from 'pg-query-stream'
import { NodePgClient } from 'drizzle-orm/node-postgres'

export class DrizzleQueryStreamFactory {
  constructor(
    private readonly client: NodePgClient,
    private readonly dialect: PgDialect,
  ) {}

  execute<T extends SQLWrapper>(query: T): Readable {
    const sql = this.dialect.sqlToQuery(query.getSQL())
    return this.client.query(new QueryStream(sql.sql, sql.params))
  }
}
