import { Elysia } from 'elysia'
import { services } from '@/services.ts'
import { JwtService } from '@/modules/jwt/service.ts'
import { apiError } from '@time-app-test/shared/error/apiError.ts'
import { JWTPayload } from 'jose'
import { isUndefined } from '@time-app-test/shared/guards.ts'

class SessionHelper {
  readonly #headers: Record<string, string | undefined>
  readonly #jwtService: JwtService

  constructor({
    headers,
    jwtService,
  }: {
    headers: Record<string, string | undefined>
    jwtService: JwtService
  }) {
    this.#headers = headers
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
      throw apiError({
        statusCode: 401,
        errorCode: 'MISSING_AUTHORIZATION_HEADER',
        message: 'Authorization header is missing',
      })
    }

    const payload = await this.#jwtService.jwtVerify(authHeader)

    if (!('sub' in payload)) {
      throw apiError({
        statusCode: 401,
        errorCode: 'INVALID_JWT_PAYLOAD',
        message: 'Invalid JWT payload',
      })
    }

    return payload as JWTPayload & { sub: string }
  }

  async getCurrentUserId() {
    const payload = await this.getAccessToken()
    return payload.sub
  }
}

export const sessionHelper = new Elysia({ name: 'sessionHelper' })
  .use(services)
  .resolve({ as: 'scoped' }, ({ headers, jwtService }) => {
    return {
      session: new SessionHelper({ headers, jwtService }),
    }
  })
