import { createApiController } from '@/adapter/rest/utils/apiController.ts'
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
import { Config } from '@time-app-test/shared/model/domain/config.ts'

export function authController(config: Config.ApplicationConfig) {
  return createApiController(config, {
    prefix: '/auth',
    detail: { tags: ['Auth'] },
  })
    .post(
      '/register/start',
      async ({ body, authService }) => {
        return await authService.registerStart(body)
      },
      {
        body: RegisterStartBodySchema,
        response: RegisterStartResponseSchema,
        transacting: true,
      },
    )
    .post(
      '/register/finish',
      async ({ body, authService }) => {
        await authService.registerFinish(body)
      },
      {
        body: RegisterFinishBodySchema,
        transacting: true,
      },
    )
    .post(
      '/add/start',
      ({ body, session, authService }) => {
        const userId = session.getCurrentUserId()
        return authService.addAuthMethodStart({ userId, ...body })
      },
      {
        body: AddAuthStartBodySchema,
        response: AddAuthStartResponseSchema,
        validateSession: true,
        transacting: true,
      },
    )
    .post(
      '/add/finish',
      ({ body, session, authService }) => {
        const userId = session.getCurrentUserId()
        return authService.addAuthMethodFinish({ userId, ...body })
      },
      {
        body: AddAuthFinishBodySchema,
        validateSession: true,
        transacting: true,
      },
    )
    .post(
      '/login/start',
      async ({ body, authService }) => {
        return await authService.loginStart(body)
      },
      {
        body: LoginStartBodySchema,
        response: LoginStartResponseSchema,
        transacting: true,
      },
    )
    .post(
      '/login/finish',
      async ({ body, authService, session }) => {
        const { refreshToken, ...response } =
          await authService.loginFinish(body)
        session.setRefreshToken(refreshToken)
        return response
      },
      {
        body: LoginFinishBodySchema,
        response: LoginFinishResponseSchema,
        transacting: true,
      },
    )
    .post(
      '/get-token',
      async ({ authService, session }) => {
        const refreshToken = session.getRefreshToken()
        return await authService.getAccessTokenWithRefreshToken({
          refreshToken,
        })
      },
      {
        response: GetTokenResponseSchema,
        authorizationHeader: true,
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
}
