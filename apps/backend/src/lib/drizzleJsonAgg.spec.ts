import { describe, it, expect } from 'vitest'
import { PgDialect, pgTable, QueryBuilder, varchar } from 'drizzle-orm/pg-core'
import { jsonAgg } from '@/lib/drizzleJsonAgg.ts'
import { bytea } from '@/lib/drizzle.ts'

const table = pgTable('test', {
  id: varchar(),
  test: bytea(),
})

const pgDialect = new PgDialect()
const qb = new QueryBuilder({
  casing: 'snake_case',
})

describe('Drizzle Json Agg', () => {
  it('builds correct json', () => {
    const query = qb
      .select({
        items: jsonAgg({ id: table.id, foo: table.test }),
      })
      .from(table)
      .groupBy(table.id)

    expect(pgDialect.sqlToQuery(query.getSQL()).sql).toEqual(
      `select json_agg(json_build_object('id', "test"."id", 'foo', encode("test"."test", 'hex'))) from "test" group by "test"."id"`,
    )
  })
})
