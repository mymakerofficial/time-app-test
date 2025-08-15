import { createApiController } from '@/lib/apiController.ts'
import { TimeEntriesModel } from '@/modules/timeEntries/model.ts'
import { t } from 'elysia'

export const timeEntriesController = createApiController({
  prefix: '/time-entries',
  detail: { tags: ['Time Entries'] },
}).get(
  '/range',
  ({ timeEntriesService, query: { start, end } }) => {
    const stream = timeEntriesService.getRange({ start, end })

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
