import { Elysia } from 'elysia'
import { authController } from '@/modules/auth/controller.ts'
import { ApiError } from '@time-app-test/shared/error/apiError.ts'

export const apiController = new Elysia({ prefix: '/api' })
  .use(authController)
  .error({
    API_ERROR: ApiError,
  })
  .onError((ctx) => {
    console.log(ctx)
  })
