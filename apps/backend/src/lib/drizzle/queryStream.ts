import type { SQLWrapper } from 'drizzle-orm/sql/sql'
import { Readable } from 'node:stream'
import { PgDialect } from 'drizzle-orm/pg-core'
import QueryStream from 'pg-query-stream'
import { NodePgClient } from 'drizzle-orm/node-postgres'
import { UniversalPgClient } from '@/lib/drizzle/types.ts'
import { PGlite } from '@electric-sql/pglite'
import { NotImplemented } from '@time-app-test/shared/error/errors.ts'

interface DrizzleQueryStreamFactory {
  execute<T extends SQLWrapper>(query: T): Readable
}

export class DrizzleQueryStreamFactoryFactory {
  static create(
    client: UniversalPgClient,
    dialect: PgDialect,
  ): DrizzleQueryStreamFactory {
    if (client instanceof PGlite) {
      return new PgLiteQueryStreamFactory()
    }
    return new NodePgQueryStreamFactory(client, dialect)
  }
}

export class NodePgQueryStreamFactory {
  constructor(
    private readonly client: NodePgClient,
    private readonly dialect: PgDialect,
  ) {}

  execute<T extends SQLWrapper>(query: T): Readable {
    const sql = this.dialect.sqlToQuery(query.getSQL())
    return this.client.query(new QueryStream(sql.sql, sql.params))
  }
}

export class PgLiteQueryStreamFactory {
  constructor() {}

  execute<T extends SQLWrapper>(_query: T): Readable {
    throw NotImplemented()
  }
}
