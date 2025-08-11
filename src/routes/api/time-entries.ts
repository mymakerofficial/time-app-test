import { createServerFileRoute } from '@tanstack/react-start/server'
import { Pool, PoolClient } from 'pg'
import QueryStream from 'pg-query-stream'
import { drizzle } from 'drizzle-orm/node-postgres'
import { timeEntries, TimeEntriesInsertSchema } from '@/lib/db/schema/schema.ts'
import msgpack from '@ygoe/msgpack'
import { PgSelect } from 'drizzle-orm/pg-core'
import {
  GetTimeEntriesParamsSchema,
  GetTimeEntriesResponseSchema,
  StreamingResponseRowType,
} from '@/lib/schema/timeEntries.ts'
import { and, gt, lt } from 'drizzle-orm'
import { z } from 'zod'

const pool = new Pool({
  connectionString:
    'postgres://postgres_user:password@localhost:5432/postgres_db',
})

const client = await pool.connect()
const db = drizzle({ client, schema: { timeEntries } })

function drizzleQueryStream<T extends { toSQL: PgSelect['toSQL'] }>(
  client: PoolClient,
  query: T,
) {
  const sql = query.toSQL()
  return client.query(new QueryStream(sql.sql, sql.params))
}

function getParams<T extends z.ZodObject>({
  request,
  schema,
}: {
  request: Request
  schema: T
}): z.infer<T> {
  const url = new URL(request.url)
  const params: Record<string, string> = {}
  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value
  }
  return schema.parse(params)
}

async function getEncodedBody<T extends z.ZodTypeAny>({
  request,
  schema,
}: {
  request: Request
  schema: T
}): Promise<z.infer<T>> {
  const data = await request.bytes()
  return schema.parse(msgpack.decode(data))
}

function createEncodedStream<T extends z.ZodTypeAny>({
  schema,
  handler,
}: {
  schema: T
  handler: (
    controller: ReadableStreamDefaultController<z.infer<T>>,
  ) => void | Promise<void>
}): ReadableStream {
  return new ReadableStream({
    start: handler,
  }).pipeThrough(
    new TransformStream({
      transform: (chunk, controller) => {
        controller.enqueue(msgpack.encode(schema.parse(chunk)))
      },
    }),
  )
}

export const ServerRoute = createServerFileRoute('/api/time-entries').methods({
  GET: ({ request }) => {
    const stream = createEncodedStream({
      schema: GetTimeEntriesResponseSchema,
      handler: async (controller) => {
        const { start, end } = getParams({
          request,
          schema: GetTimeEntriesParamsSchema,
        })

        const query = db
          .select()
          .from(timeEntries)
          .where(
            and(
              gt(timeEntries.lookupKey, start),
              lt(timeEntries.lookupKey, end),
            ),
          )

        const count = await db.$count(query)

        controller.enqueue({
          t: StreamingResponseRowType.HEADER,
          data: {
            count,
          },
        })

        const queryStream = drizzleQueryStream(client, query)

        queryStream.on('data', (row) => {
          controller.enqueue({
            t: StreamingResponseRowType.ROW,
            data: row,
          })
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
    const body = await getEncodedBody({
      request,
      schema: TimeEntriesInsertSchema.array(),
    })

    await db.insert(timeEntries).values(body)

    return new Response(undefined, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },
})
