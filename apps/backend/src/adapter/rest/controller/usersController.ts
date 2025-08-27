import { createApiController } from '@/adapter/rest/utils/apiController.ts'
import { createLocalHook } from '@/adapter/rest/utils/zodAdapter.ts'
import { GetUsersMeResponse } from '@time-app-test/shared/model/rest/user.ts'

export const usersController = createApiController({
  prefix: '/users',
  detail: { tags: ['Users'] },
}).get(
  '/me',
  async ({ userPersistence, session }) => {
    const userId = session.getCurrentUserId()
    return await userPersistence.getUserById(userId)
  },
  createLocalHook({
    response: GetUsersMeResponse,
    validateSession: true,
  }),
)
