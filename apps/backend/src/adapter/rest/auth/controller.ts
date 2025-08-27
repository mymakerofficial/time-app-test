import { AuthModel } from '@/adapter/rest/auth/model.ts'
import { createApiController } from '@/adapter/rest/utils/apiController.ts'

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
      const { refreshToken, ...response } = await authService.loginFinish(body)
      session.setRefreshToken(refreshToken)
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
    async ({ session, authCache }) => {
      const refreshToken = session.getRefreshToken()
      authCache.deleteRefreshToken(refreshToken)
      session.clearRefreshToken()
    },
    {
      validateSession: true,
    },
  )
