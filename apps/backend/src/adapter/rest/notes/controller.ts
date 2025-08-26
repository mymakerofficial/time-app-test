import { createApiController } from '@/adapter/rest/utils/apiController.ts'
import { t } from 'elysia'

export const notesController = createApiController({
  prefix: '/notes',
  detail: { tags: ['Notes'] },
}).get(
  '/',
  async ({ session, notesService }) => {
    const userId = session.getCurrentUserId()
    return await notesService.getAll(userId)
  },
  {
    response: t.Array(
      t.Object({
        id: t.String(),
        createdAt: t.String(),
        updatedAt: t.String(),
        message: t.String(),
      }),
    ),
    validateSession: true,
  },
)
