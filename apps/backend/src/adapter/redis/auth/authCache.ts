import { RedisClientType } from 'redis'
import { AuthCachePort } from '@/application/port/authCachePort.ts'
import {
  RegistrationCacheDto,
  RegistrationCacheDtoSchema,
} from '@time-app-test/shared/model/domain/auth/registrationCache.ts'
import {
  LoginCacheDto,
  LoginCacheDtoSchema,
} from '@time-app-test/shared/model/domain/auth/loginCache.ts'

const PENDING_LOGIN_PREFIX = 'pending-login'
const PENDING_REGISTRATION_PREFIX = 'pending-registration'
const REFRESH_TOKEN_PREFIX = 'refresh-token'

export class RedisAuthCache implements AuthCachePort {
  readonly #redis: RedisClientType

  constructor(container: { redis: RedisClientType }) {
    this.#redis = container.redis
  }

  async setPendingLogin(
    userId: string,
    data: LoginCacheDto,
    expirySec: number,
  ): Promise<void> {
    await this.#redis.set(
      `${PENDING_LOGIN_PREFIX}:${userId}`,
      JSON.stringify(data),
      {
        expiration: { type: 'EX', value: expirySec },
      },
    )
  }

  async getPendingLogin(userId: string): Promise<LoginCacheDto | undefined> {
    const res = await this.#redis.get(`${PENDING_LOGIN_PREFIX}:${userId}`)
    return res ? LoginCacheDtoSchema.parse(JSON.parse(res)) : undefined
  }

  async deletePendingLogin(userId: string) {
    await this.#redis.del(`${PENDING_LOGIN_PREFIX}:${userId}`)
  }

  async setPendingRegistration(
    userId: string,
    data: RegistrationCacheDto,
    expirySec: number,
  ): Promise<void> {
    await this.#redis.set(
      `${PENDING_REGISTRATION_PREFIX}:${userId}`,
      JSON.stringify(data),
      {
        expiration: { type: 'EX', value: expirySec },
      },
    )
  }

  async getPendingRegistration(
    userId: string,
  ): Promise<RegistrationCacheDto | undefined> {
    const res = await this.#redis.get(
      `${PENDING_REGISTRATION_PREFIX}:${userId}`,
    )
    return res ? RegistrationCacheDtoSchema.parse(JSON.parse(res)) : undefined
  }

  async deletePendingRegistration(userId: string): Promise<void> {
    await this.#redis.del(`${PENDING_REGISTRATION_PREFIX}:${userId}`)
  }

  async setRefreshToken({
    refreshToken,
    userId,
    expirySec,
  }: {
    refreshToken: string
    userId: string
    expirySec: number
  }): Promise<void> {
    await this.#redis.set(`${REFRESH_TOKEN_PREFIX}:${refreshToken}`, userId, {
      expiration: { type: 'EX', value: expirySec },
    })
  }

  async getRefreshToken(refreshToken: string): Promise<string | undefined> {
    const res = await this.#redis.get(`${REFRESH_TOKEN_PREFIX}:${refreshToken}`)
    return res ?? undefined
  }

  async deleteRefreshToken(refreshToken: string) {
    await this.#redis.del(`${REFRESH_TOKEN_PREFIX}:${refreshToken}`)
  }
}
