import { createApiController } from '@/adapter/rest/utils/apiController.ts'
import { t } from 'elysia'

export const timeEntriesController = createApiController({
  prefix: '/time-entries',
  detail: { tags: ['Time Entries'] },
}).get(
  '/range',
  async ({ session, timeEntriesService, query: range }) => {
    const userId = session.getCurrentUserId()
    return await timeEntriesService.getAllInRange(range, userId)
  },
  {
    query: t.Object({
      start: t.Integer(),
      end: t.Integer(),
    }),
    response: t.Array(
      t.Object({
        id: t.String(),
        createdAt: t.String(),
        updatedAt: t.String(),
        lookupKey: t.Integer(),
        startedAt: t.String(),
        endedAt: t.Nullable(t.String()),
        message: t.String(),
      }),
    ),
    validateSession: true,
  },
)
