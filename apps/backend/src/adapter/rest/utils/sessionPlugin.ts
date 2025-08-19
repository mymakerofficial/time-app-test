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

class Session {
  readonly #headers: Record<string, string | undefined>
  readonly #cookie: Record<string, Cookie<string | undefined>>
  readonly #tokenService: TokenService

  constructor({
    headers,
    cookie,
    tokenService,
  }: {
    headers: Record<string, string | undefined>
    cookie: Record<string, Cookie<string | undefined>>
    tokenService: TokenService
  }) {
    this.#headers = headers
    this.#cookie = cookie
    this.#tokenService = tokenService
  }

  getRawAuthHeader() {
    if (!this.#headers.authorization?.startsWith('Bearer ')) {
      return undefined
    }

    return this.#headers.authorization.split(' ')[1]
  }

  getAccessToken() {
    const authHeader = this.getRawAuthHeader()

    if (isUndefined(authHeader)) {
      throw MissingAuthorizationHeader()
    }

    return authHeader
  }

  getRawRefreshTokenCookie() {
    return this.#cookie.refreshToken
  }

  getRefreshToken() {
    const { value } = this.getRawRefreshTokenCookie()

    if (isUndefined(value) || !isString(value)) {
      throw MissingRefreshToken()
    }

    return value
  }

  setRefreshToken({ value, maxAge }: { value: string; maxAge: number }) {
    this.#cookie.refreshToken.set({
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: true,
      value,
      maxAge,
    })
  }

  clearRefreshToken() {
    this.#cookie.refreshToken.remove()
  }

  async validateSession() {
    const { jwtPayload, deviceId } = await this.#tokenService.validateSession({
      accessToken: this.getAccessToken(),
      refreshToken: this.getRefreshToken(),
    })
    return new ValidatedSession({
      jwtPayload,
      deviceId,
      headers: this.#headers,
      cookie: this.#cookie,
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
    headers,
    cookie,
    tokenService,
  }: {
    jwtPayload: CustomJwtPayload
    deviceId: string
    headers: Record<string, string | undefined>
    cookie: Record<string, Cookie<string | undefined>>
    tokenService: TokenService
  }) {
    super({
      headers,
      cookie,
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
  .resolve({ as: 'scoped' }, ({ headers, cookie, tokenService }) => {
    return {
      session: new Session({ headers, cookie, tokenService }),
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
