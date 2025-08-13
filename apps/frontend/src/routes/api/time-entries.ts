import { createServerFileRoute } from '@tanstack/react-start/server'
import { timeEntries, TimeEntriesInsertSchema } from '../../lib/db/schema/schema.ts'
import {
  GetTimeEntriesParamsSchema,
  GetTimeEntriesResponseSchema,
  StreamingResponseRowType,
} from '../../lib/schema/timeEntries.ts'
import { and, gt, lt } from 'drizzle-orm'
import {
  createEncodedStream,
  drizzleQueryStream,
  getEncodedBody,
  getParams,
} from '../../lib/backend/utils.ts'
import { client, db } from '../../lib/backend/constants.ts'

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
