import { Cookie, Elysia } from 'elysia'
import { services } from '@/services.ts'
import { JwtService } from '@/modules/jwt/service.ts'
import { isString, isUndefined } from '@time-app-test/shared/guards.ts'
import {
  MissingAuthorizationHeader,
  MissingRefreshToken,
} from '@time-app-test/shared/error/errors.ts'

class SessionHelper {
  readonly #headers: Record<string, string | undefined>
  readonly #cookie: Record<string, Cookie<string | undefined>>
  readonly #jwtService: JwtService

  constructor({
    headers,
    cookie,
    jwtService,
  }: {
    headers: Record<string, string | undefined>
    cookie: Record<string, Cookie<string | undefined>>
    jwtService: JwtService
  }) {
    this.#headers = headers
    this.#cookie = cookie
    this.#jwtService = jwtService
  }

  getRawAuthHeader() {
    if (!this.#headers.authorization?.startsWith('Bearer ')) {
      return undefined
    }

    return this.#headers.authorization.split(' ')[1]
  }

  async getAccessToken() {
    const authHeader = this.getRawAuthHeader()

    if (isUndefined(authHeader)) {
      throw MissingAuthorizationHeader()
    }

    return await this.#jwtService.jwtVerify(authHeader)
  }

  async getCurrentUserId() {
    const payload = await this.getAccessToken()
    return payload.sub
  }

  getRawRefreshTokenCookie() {
    return this.#cookie.refreshToken?.cookie
  }

  getRefreshToken() {
    const { value } = this.getRawRefreshTokenCookie()

    if (isUndefined(value) || !isString(value)) {
      throw MissingRefreshToken()
    }

    return value
  }
}

export const sessionHelper = new Elysia({ name: 'sessionHelper' })
  .use(services)
  .resolve({ as: 'scoped' }, ({ headers, cookie, jwtService }) => {
    return {
      session: new SessionHelper({ headers, cookie, jwtService }),
    }
  })
