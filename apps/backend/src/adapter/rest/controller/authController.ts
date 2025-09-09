import { createApiController } from '@/adapter/rest/utils/apiController.ts'
import { createLocalHook } from '@/adapter/rest/utils/zodAdapter.ts'
import {
  AddAuthFinishBodySchema,
  AddAuthStartBodySchema,
  AddAuthStartResponseSchema,
  GetTokenResponseSchema,
  LoginFinishBodySchema,
  LoginFinishResponseSchema,
  LoginStartBodySchema,
  LoginStartResponseSchema,
  RegisterFinishBodySchema,
  RegisterStartBodySchema,
  RegisterStartResponseSchema,
} from '@time-app-test/shared/model/rest/auth.ts'

export const authController = createApiController({
  prefix: '/auth',
  detail: { tags: ['Auth'] },
})
  .post(
    '/register/start',
    async ({ body, authService }) => {
      return await authService.registerStart(body)
    },
    createLocalHook({
      body: RegisterStartBodySchema,
      response: RegisterStartResponseSchema,
    }),
  )
  .post(
    '/register/finish',
    async ({ body, authService }) => {
      await authService.registerFinish(body)
    },
    createLocalHook({
      body: RegisterFinishBodySchema,
    }),
  )
  .post(
    '/add/start',
    ({ body, session, authService }) => {
      const userId = session.getCurrentUserId()
      return authService.addAuthMethodStart({ userId, ...body })
    },
    createLocalHook({
      body: AddAuthStartBodySchema,
      response: AddAuthStartResponseSchema,
      validateSession: true,
    }),
  )
  .post(
    '/add/finish',
    ({ body, session, authService }) => {
      const userId = session.getCurrentUserId()
      return authService.addAuthMethodFinish({ userId, ...body })
    },
    createLocalHook({
      body: AddAuthFinishBodySchema,
      validateSession: true,
    }),
  )
  .post(
    '/login/start',
    async ({ body, authService }) => {
      return await authService.loginStart(body)
    },
    createLocalHook({
      body: LoginStartBodySchema,
      response: LoginStartResponseSchema,
    }),
  )
  .post(
    '/login/finish',
    async ({ body, authService, session }) => {
      const { refreshToken, ...response } = await authService.loginFinish(body)
      session.setRefreshToken(refreshToken)
      return response
    },
    createLocalHook({
      body: LoginFinishBodySchema,
      response: LoginFinishResponseSchema,
    }),
  )
  .post(
    '/get-token',
    async ({ authService, session }) => {
      const refreshToken = session.getRefreshToken()
      return await authService.getAccessTokenWithRefreshToken({ refreshToken })
    },
    createLocalHook({
      response: GetTokenResponseSchema,
    }),
  )
  .post(
    '/logout',
    async ({ session, authCache }) => {
      const refreshToken = session.getRefreshToken()
      authCache.deleteRefreshToken(refreshToken)
      session.clearRefreshToken()
    },
    createLocalHook({
      validateSession: true,
    }),
  )
