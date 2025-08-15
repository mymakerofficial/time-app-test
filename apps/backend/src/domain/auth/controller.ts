import { AuthModel } from '@/domain/auth/model.ts'
import { createApiController } from '@/lib/apiController.ts'

export const authController = createApiController({
  prefix: '/auth',
  detail: { tags: ['Auth'] },
})
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
  .post(
    '/get-token',
    async ({ authService, session }) => {
      const refreshToken = session.getRefreshToken()
      return await authService.getAccessTokenWithRefreshToken({ refreshToken })
    },
    {
      response: AuthModel.GetTokenResponse,
    },
  )
