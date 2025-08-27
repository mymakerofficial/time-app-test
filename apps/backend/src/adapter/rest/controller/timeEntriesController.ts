import { createApiController } from '@/adapter/rest/utils/apiController.ts'
import { t } from 'elysia'
import { createLocalHook } from '@/adapter/rest/utils/zodAdapter.ts'
import { GetTimeEntriesInRangeResponseSchema } from '@time-app-test/shared/model/rest/timeEntries.ts'

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
    // TODO make query work with createLocalHook
    query: t.Object({
      start: t.Integer(),
      end: t.Integer(),
    }),
    ...createLocalHook({
      response: GetTimeEntriesInRangeResponseSchema,
      validateSession: true,
    }),
  },
)
