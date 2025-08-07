import { createServerFileRoute } from '@tanstack/react-start/server'
import { Pool } from 'pg'
import QueryStream from 'pg-query-stream'
import { drizzle } from 'drizzle-orm/node-postgres'
import { timeEntries, timeEntriesInsertSchema, timeEntriesSelectSchema } from '@/lib/db/schema/schema.ts'

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

        queryStream.forEach((row) => {
          const parsedRow = timeEntriesSelectSchema.parse(row)
          console.log('Streaming row:', row, parsedRow)
          controller.enqueue(JSON.stringify(parsedRow) + '\n')
        })

        queryStream.on('end', () => {
          console.log('Query stream ended')
          controller.close()
          client.release()
        })
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
      },
    })
  },
  POST: async ({ request }) => {
    const data = await request.json()
    const validatedData = timeEntriesInsertSchema.array().parse(data)

    console.log('Inserting data:', validatedData)

    const client = await pool.connect()
    const db = drizzle({ client })

    const res = await db.insert(timeEntries).values(validatedData).returning()

    client.release()

    return new Response(JSON.stringify(res.map(timeEntriesSelectSchema.parse)), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  },
})
