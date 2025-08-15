import { Elysia } from 'elysia'
import { services } from '@/services.ts'
import { JwtService } from '@/modules/jwt/service.ts'
import { isUndefined } from '@time-app-test/shared/guards.ts'
import { MissingAuthorizationHeader } from '@time-app-test/shared/error/errors.ts'

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
      throw MissingAuthorizationHeader()
    }

    return await this.#jwtService.jwtVerify(authHeader)
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
