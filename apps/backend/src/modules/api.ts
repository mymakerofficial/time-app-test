import { Elysia } from 'elysia'
import { authController } from '@/modules/auth/controller.ts'
import { usersController } from '@/modules/users/controller.ts'
import { ApiError } from '@time-app-test/shared/error/apiError.ts'

export const apiController = new Elysia({ prefix: '/api' })
  .error({
    API_ERROR: ApiError,
  })
  .onError(({ code, error }) => {
    console.error(code, error)
    return new Response(ApiError.fromUnknown(error).toJSON())
  })
  .use(authController)
  .use(usersController)
