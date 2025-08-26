import { createApiController } from '@/adapter/rest/utils/apiController.ts'
import { TimeEntriesModel } from '@/adapter/rest/timeEntries/model.ts'
import { t } from 'elysia'
import { createEncodedStream } from '@/lib/streams.ts'

export const timeEntriesController = createApiController({
  prefix: '/time-entries',
  detail: { tags: ['Time Entries'] },
}).get(
  '/range',
  ({ timeEntriesService, query: range }) => {
    const stream = createEncodedStream({
      handler: async (controller) => {
        const count = await timeEntriesService.countRange(range)

        controller.enqueue({
          t: 0,
          data: { count },
        })

        const queryStream = timeEntriesService.getRangeStreaming(range)

        queryStream.on('data', (row) => {
          controller.enqueue({
            t: 1,
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
        'Content-Type': 'application/msgpack',
      },
    })
  },
  {
    query: TimeEntriesModel.RangeQuery,
    response: {
      200: t.Uint8Array(),
    },
    detail: {
      responses: {
        200: {
          description: 'A stream of time entries encoded using MessagePack.',
          content: {
            'application/msgpack': {},
          },
        },
        500: {
          $ref: '#/components/schemas/error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/error',
              },
            },
          },
        },
      },
    },
  },
)
