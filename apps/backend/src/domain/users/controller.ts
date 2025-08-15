import { t } from 'elysia'
import { isUndefined } from '@time-app-test/shared/guards.ts'
import { createApiController } from '@/lib/apiController.ts'
import { UserNotFoundById } from '@time-app-test/shared/error/errors.ts'

export const usersController = createApiController({
  prefix: '/users',
  detail: { tags: ['Users'] },
}).get(
  '/me',
  async ({ db, session }) => {
    const userId = session.getCurrentUserId()

    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, userId),
      columns: {
        id: true,
        username: true,
      },
    })

    if (isUndefined(user)) {
      throw UserNotFoundById({ id: userId })
    }

    return user
  },
  {
    response: t.Object({
      id: t.String(),
      username: t.String(),
    }),
    validateSession: true,
  },
)
