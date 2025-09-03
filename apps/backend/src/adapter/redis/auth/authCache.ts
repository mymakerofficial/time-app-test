import { RedisClientType } from 'redis'
import { isNull } from '@time-app-test/shared/guards.ts'
import {
  AuthCachePort,
  PendingLogin,
} from '@/application/port/authCachePort.ts'
import {
  RegistrationCacheDto,
  RegistrationCacheDtoSchema,
} from '@time-app-test/shared/model/domain/auth.ts'

const PENDING_PASSWORD_LOGIN_PREFIX = 'pending-password-login'
const PENDING_PASSWORD_REGISTRATION_PREFIX = 'pending-password-registration'
const REFRESH_TOKEN_PREFIX = 'pending-password-registration'

export class RedisAuthCache implements AuthCachePort {
  readonly #redis: RedisClientType

  constructor(container: { redis: RedisClientType }) {
    this.#redis = container.redis
  }

  async setPendingPasswordLogin({
    userId,
    expirySec,
    serverSecretEphemeral,
    clientPublicEphemeral,
    authSalt,
    authVerifier,
    kekSalt,
    encryptedDek,
  }: {
    userId: string
    expirySec: number
  } & PendingLogin): Promise<void> {
    await this.#redis.hSet(`${PENDING_PASSWORD_LOGIN_PREFIX}:${userId}`, {
      sse: serverSecretEphemeral,
      cpe: clientPublicEphemeral,
      slt: authSalt,
      ver: authVerifier,
      kek: kekSalt,
      dek: encryptedDek,
      ex: Date.now() + expirySec * 1000,
    })
  }

  async getPendingPasswordLogin(
    userId: string,
  ): Promise<PendingLogin | undefined> {
    const [
      serverSecretEphemeral,
      clientPublicEphemeral,
      authSalt,
      authVerifier,
      kekSalt,
      encryptedDek,
      ex,
    ] = await this.#redis.hmGet(`${PENDING_PASSWORD_LOGIN_PREFIX}:${userId}`, [
      'sse',
      'cpe',
      'slt',
      'ver',
      'kek',
      'dek',
      'ex',
    ])
    if (
      isNull(serverSecretEphemeral) ||
      isNull(clientPublicEphemeral) ||
      isNull(authSalt) ||
      isNull(authVerifier) ||
      isNull(kekSalt) ||
      isNull(encryptedDek) ||
      isNull(ex)
    ) {
      return undefined
    }
    if (Date.now() > Number(ex)) {
      await this.#redis.hDel(`${PENDING_PASSWORD_LOGIN_PREFIX}:${userId}`, [
        'sse',
        'cpe',
        'slt',
        'ver',
        'kek',
        'dek',
        'ex',
      ])
      return undefined
    }
    return {
      serverSecretEphemeral,
      clientPublicEphemeral,
      authSalt,
      authVerifier,
      kekSalt,
      encryptedDek,
    }
  }

  async deletePendingPasswordLogin(userId: string) {
    await this.#redis.del(`${PENDING_PASSWORD_LOGIN_PREFIX}:${userId}`)
  }

  async setPendingRegistration(
    userId: string,
    data: RegistrationCacheDto,
    expirySec: number,
  ): Promise<void> {
    await this.#redis.set(
      `${PENDING_PASSWORD_REGISTRATION_PREFIX}:${userId}`,
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
      `${PENDING_PASSWORD_REGISTRATION_PREFIX}:${userId}`,
    )
    return res ? RegistrationCacheDtoSchema.parse(JSON.parse(res)) : undefined
  }

  async deletePendingRegistration(userId: string): Promise<void> {
    await this.#redis.del(`${PENDING_PASSWORD_REGISTRATION_PREFIX}:${userId}`)
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
