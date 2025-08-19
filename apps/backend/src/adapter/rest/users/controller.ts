import { createApiController } from '@/adapter/rest/utils/apiController.ts'
import { UsersModel } from '@/adapter/rest/users/model.ts'

export const usersController = createApiController({
  prefix: '/users',
  detail: { tags: ['Users'] },
}).get(
  '/me',
  async ({ userPersistence, session }) => {
    const userId = session.getCurrentUserId()
    return await userPersistence.getUserById(userId)
  },
  {
    response: UsersModel.MeResponse,
    validateSession: true,
  },
)
