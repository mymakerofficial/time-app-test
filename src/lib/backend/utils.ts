import { Pool, PoolClient } from 'pg'
import { z } from 'zod'
import msgpack from '@ygoe/msgpack'
import { PgSelect } from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/node-postgres'
import { timeEntries, users } from '@/lib/db/schema/schema.ts'
import QueryStream from 'pg-query-stream'
import { ApiError, ApiErrorSchema } from '@/lib/schema/error.ts'

const pool = new Pool({
  connectionString:
    'postgres://postgres_user:password@localhost:5432/postgres_db',
})
export const client = await pool.connect()
export const db = drizzle({ client, schema: { timeEntries, users } })

export function drizzleQueryStream<T extends { toSQL: PgSelect['toSQL'] }>(
  client: PoolClient,
  query: T,
) {
  const sql = query.toSQL()
  return client.query(new QueryStream(sql.sql, sql.params))
}

export function getParams<T extends z.ZodObject>({
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

export async function getRequestBody<T extends z.ZodTypeAny>({
  request,
  schema,
}: {
  request: Request
  schema: T
}): Promise<z.infer<T>> {
  const data = await request.json()
  return schema.parse(data)
}

export async function getEncodedBody<T extends z.ZodTypeAny>({
  request,
  schema,
}: {
  request: Request
  schema: T
}): Promise<z.infer<T>> {
  const data = await request.bytes()
  return schema.parse(msgpack.decode(data))
}

export function createEncodedStream<T extends z.ZodTypeAny>({
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

export function errorResponse(err: ApiError) {
  return new Response(JSON.stringify(ApiErrorSchema.parse(err)), {
    status: 400,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
