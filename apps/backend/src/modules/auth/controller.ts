import { Elysia } from 'elysia'
import { AuthModel } from '@/modules/auth/model.ts'
import { containerPlugin } from '@/services.ts'

export const authController = new Elysia({
  prefix: '/auth',
  detail: { tags: ['Auth'] },
})
  .use(containerPlugin)
  .post(
    '/register/start',
    async ({ authService, body }) => {
      return await authService.registerStart(body)
    },
    {
      body: AuthModel.RegisterStartBody,
      response: AuthModel.RegisterStartResponse,
    },
  )
  .post(
    '/register/finish',
    async ({ authService, body }) => {
      await authService.registerFinish(body)
    },
    {
      body: AuthModel.RegisterFinishBody,
    },
  )
  .post(
    '/login/start',
    async ({ authService, body }) => {
      return await authService.loginStart(body)
    },
    {
      body: AuthModel.LoginStartBody,
      response: AuthModel.LoginStartResponse,
    },
  )
  .post(
    '/login/finish',
    async ({ authService, body, set }) => {
      const { response, refreshToken, refreshTokenMaxAge } =
        await authService.loginFinish(body)

      set.headers['set-cookie'] =
        `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${refreshTokenMaxAge}; SameSite=Strict; Secure`
      return response
    },
    {
      body: AuthModel.LoginFinishBody,
      response: AuthModel.LoginFinishResponse,
    },
  )
