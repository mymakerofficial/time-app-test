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
    async ({ authService, session, body }) => {
      const { response, cookie } = await authService.loginFinish(body)
      session.setRefreshToken(cookie)
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
  .post(
    '/logout',
    async ({ session }) => {
      // TODO invalidate the jwt somehow
      session.clearRefreshToken()
    },
    {
      validateSession: true,
    },
  )
