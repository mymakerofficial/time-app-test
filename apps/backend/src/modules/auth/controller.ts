import { Elysia } from 'elysia'
import { authService } from '@/modules/auth/service.ts'
import { AuthModel } from '@/modules/auth/model.ts'

export const authController = new Elysia({ prefix: '/auth' })
  .use(authService)
  .post(
    '/login/start',
    async ({ authService, body }) => {
      return await authService.loginStart(body)
    },
    {
      body: AuthModel.loginStartBody,
      response: AuthModel.loginStartResponse,
    },
  )
