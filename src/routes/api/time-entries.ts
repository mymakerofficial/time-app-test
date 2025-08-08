import { createServerFileRoute } from '@tanstack/react-start/server'
import { Pool } from 'pg'
import QueryStream from 'pg-query-stream'
import { drizzle } from 'drizzle-orm/node-postgres'
import { timeEntries, timeEntriesInsertSchema, timeEntriesSelectSchema } from '@/lib/db/schema/schema.ts'
import msgpack from '@ygoe/msgpack'

const pool = new Pool({
  connectionString:
    'postgres://postgres_user:password@localhost:5432/postgres_db',
})

export const ServerRoute = createServerFileRoute('/api/time-entries').methods({
  GET: () => {
    const stream = new ReadableStream({
      start: async (controller) => {
        const client = await pool.connect()

        const query = new QueryStream('SELECT * FROM time_entries')
        const queryStream = client.query(query)

        queryStream.on('data', (row) => {
          const parsedRow = timeEntriesSelectSchema.parse(row)
          const buf = msgpack.encode(parsedRow);
          controller.enqueue(buf);
        });

        queryStream.on('end', () => {
          controller.close()
          client.release()
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
    const validatedData = timeEntriesInsertSchema.array().parse(decodedData)

    const client = await pool.connect()
    const db = drizzle({ client })

    await db.insert(timeEntries).values(validatedData)

    client.release()

    return new Response(undefined, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },
})
