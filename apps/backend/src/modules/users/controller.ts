import { t } from 'elysia'
import { isUndefined } from '@time-app-test/shared/guards.ts'
import { apiError } from '@time-app-test/shared/error/apiError.ts'
import { createApiController } from '@/lib/apiController.ts'

export const usersController = createApiController({
  prefix: '/users',
  detail: { tags: ['Users'] },
}).get(
  '/me',
  async ({ session, db }) => {
    const userId = await session.getCurrentUserId()
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      columns: {
        id: true,
        username: true,
      },
    })

    if (isUndefined(user)) {
      throw apiError({
        message: `User with id "${userId}" does not exist`,
        errorCode: 'USER_NOT_FOUND',
        statusCode: 404,
      })
    }

    return user
  },
  {
    response: t.Object({
      id: t.String(),
      username: t.String(),
    }),
  },
)
