import { createApiController } from '@/adapter/rest/utils/apiController.ts'
import { GetUsersMeResponse } from '@time-app-test/shared/model/rest/user.ts'
import { Config } from '@time-app-test/shared/model/domain/config.ts'

export function usersController(config: Config.ApplicationConfig) {
  return createApiController(config, {
    prefix: '/users',
    detail: { tags: ['Users'] },
  }).get(
    '/me',
    async ({ userPersistence, session }) => {
      const userId = session.getCurrentUserId()
      return await userPersistence.getUserById(userId)
    },
    {
      response: GetUsersMeResponse,
      validateSession: true,
    },
  )
}
