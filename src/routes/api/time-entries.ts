import { createServerFileRoute } from '@tanstack/react-start/server'
import { Pool, PoolClient } from 'pg'
import QueryStream from 'pg-query-stream'
import { drizzle } from 'drizzle-orm/node-postgres'
import {
  timeEntries,
  TimeEntriesInsertSchema,
  TimeEntriesSelectSchema,
} from '@/lib/db/schema/schema.ts'
import msgpack from '@ygoe/msgpack'
import { PgSelect, QueryBuilder } from 'drizzle-orm/pg-core'
import {
  GetTimeEntriesParamsSchema,
  StreamingResponseHeaderSchema,
  StreamingResponseRowType,
} from '@/lib/schema/timeEntries.ts'
import { and, gt, lt } from 'drizzle-orm'
import { z } from 'zod'

const pool = new Pool({
  connectionString:
    'postgres://postgres_user:password@localhost:5432/postgres_db',
})

const client = await pool.connect()
const db = drizzle({ client })

const qb = new QueryBuilder()

function drizzleQueryStream<T extends { toSQL: PgSelect['toSQL'] }>(
  client: PoolClient,
  query: T,
) {
  const sql = query.toSQL()
  return client.query(new QueryStream(sql.sql, sql.params))
}

function getParams<T extends z.ZodObject>(
  request: Request,
  schema: T,
): z.infer<T> {
  const url = new URL(request.url)
  const params: Record<string, string> = {}
  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value
  }
  return schema.parse(params)
}

export const ServerRoute = createServerFileRoute('/api/time-entries').methods({
  GET: async ({ request }) => {
    const stream = new ReadableStream({
      start: async (controller) => {
        const { start, end } = getParams(request, GetTimeEntriesParamsSchema)

        const query = qb
          .select()
          .from(timeEntries)
          .where(
            and(
              gt(timeEntries.lookupKey, start),
              lt(timeEntries.lookupKey, end),
            ),
          )

        const count = await db.$count(query)

        controller.enqueue(
          msgpack.encode({
            t: StreamingResponseRowType.HEADER,
            data: StreamingResponseHeaderSchema.parse({
              count,
            }),
          }),
        )

        const queryStream = drizzleQueryStream(client, query)

        queryStream.on('data', (row) => {
          const parsedRow = TimeEntriesSelectSchema.parse(row)
          const buf = msgpack.encode({
            t: StreamingResponseRowType.ENTRY,
            data: parsedRow,
          })
          controller.enqueue(buf)
        })

        queryStream.on('end', () => {
          controller.close()
        })
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    })
  },
  POST: async ({ request }) => {
    const data = await request.bytes()
    const decodedData = msgpack.decode(data) as unknown[]
    const validatedData = TimeEntriesInsertSchema.array().parse(decodedData)

    await db.insert(timeEntries).values(validatedData)

    return new Response(undefined, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },
})
