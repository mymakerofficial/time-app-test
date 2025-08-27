import { Cookie, Elysia } from 'elysia'
import { servicesPlugin } from '@/config/services.ts'
import { isString, isUndefined } from '@time-app-test/shared/guards.ts'
import {
  MissingAuthorizationHeader,
  MissingRefreshToken,
} from '@time-app-test/shared/error/errors.ts'
import {
  CustomJwtPayload,
  TokenService,
} from '@/application/service/tokenService.ts'
import z from 'zod'

export interface SessionContext {
  request: Request
  headers: Record<string, string | undefined>
  cookie: Record<string, Cookie<string | undefined>>
}

class Session {
  readonly #context: SessionContext
  readonly #tokenService: TokenService

  constructor({
    tokenService,
    ...context
  }: {
    tokenService: TokenService
  } & SessionContext) {
    this.#context = context
    this.#tokenService = tokenService
  }

  async getBody<T extends z.ZodType>(schema: T): Promise<z.Infer<T>> {
    const json = await this.#context.request.json()
    return schema.parse(json)
  }

  #getRawAuthHeader() {
    if (!this.#context.headers.authorization?.startsWith('Bearer ')) {
      return undefined
    }

    return this.#context.headers.authorization.split(' ')[1]
  }

  getAccessToken() {
    const authHeader = this.#getRawAuthHeader()

    if (isUndefined(authHeader)) {
      throw MissingAuthorizationHeader()
    }

    return authHeader
  }

  #getRawRefreshTokenCookie() {
    return this.#context.cookie.refreshToken
  }

  getRefreshToken() {
    const { value } = this.#getRawRefreshTokenCookie()

    if (isUndefined(value) || !isString(value)) {
      throw MissingRefreshToken()
    }

    return value
  }

  setRefreshToken({ value, maxAge }: { value: string; maxAge: number }) {
    this.#context.cookie.refreshToken.set({
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: true,
      value,
      maxAge,
    })
  }

  clearRefreshToken() {
    this.#context.cookie.refreshToken.remove()
  }

  async validateSession() {
    const { jwtPayload, deviceId } = await this.#tokenService.validateSession({
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
    })
    return new ValidatedSession({
      jwtPayload,
      deviceId,
      ...this.#context,
      tokenService: this.#tokenService,
    })
  }
}

class ValidatedSession extends Session {
  readonly #jwtPayload: CustomJwtPayload
  readonly #deviceId: string

  constructor({
    jwtPayload,
    deviceId,
    tokenService,
    ...context
  }: {
    jwtPayload: CustomJwtPayload
    deviceId: string
    tokenService: TokenService
  } & SessionContext) {
    super({
      ...context,
      tokenService,
    })
    this.#jwtPayload = jwtPayload
    this.#deviceId = deviceId
  }

  getCurrentUserId() {
    return this.#jwtPayload.sub
  }

  getDeviceId() {
    return this.#deviceId
  }
}

export const sessionPlugin = new Elysia({ name: 'session' })
  .use(servicesPlugin)
  .resolve({ as: 'scoped' }, (context) => {
    return {
      session: new Session(context),
    }
  })
  .macro({
    validateSession: (enabled: true) => ({
      resolve: async ({ session }) => {
        if (!enabled || !session) {
          return
        }
        return { session: await session.validateSession() }
      },
    }),
  })
