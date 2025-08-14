import { Elysia, t } from 'elysia'
import { services } from '@/services.ts'
import { sessionHelper } from '@/lib/sessionHelper.ts'
import { isUndefined } from '@time-app-test/shared/guards.ts'
import { apiError } from '@time-app-test/shared/error/apiError.ts'

export const usersController = new Elysia({
  prefix: '/users',
  detail: { tags: ['Users'] },
})
  .use(services)
  .use(sessionHelper)
  .get(
    '/me',
    async ({ sessionHelper, db }) => {
      const userId = await sessionHelper.getCurrentUserId()
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
