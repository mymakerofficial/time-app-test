import { RedisClientType } from 'redis'
import { isNull } from '@time-app-test/shared/guards.ts'
import {
  AuthCachePort,
  PendingLogin,
} from '@/application/port/authCachePort.ts'

export class RedisAuthCache implements AuthCachePort {
  readonly #redis: RedisClientType

  constructor(container: { redis: RedisClientType }) {
    this.#redis = container.redis
  }

  async setPendingLogin({
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
    await this.#redis.hSet(`pending-login:${userId}`, {
      sse: serverSecretEphemeral,
      cpe: clientPublicEphemeral,
      slt: authSalt,
      ver: authVerifier,
      kek: kekSalt,
      dek: encryptedDek,
      ex: Date.now() + expirySec * 1000,
    })
  }

  async getPendingLogin(userId: string): Promise<PendingLogin | undefined> {
    const [
      serverSecretEphemeral,
      clientPublicEphemeral,
      authSalt,
      authVerifier,
      kekSalt,
      encryptedDek,
      ex,
    ] = await this.#redis.hmGet(`pending-login:${userId}`, [
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
      await this.#redis.hDel(`pending-login:${userId}`, [
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

  async deletePendingLogin(userId: string) {
    await this.#redis.del(`pending-login:${userId}`)
  }

  async setPendingRegistration({
    userId,
    username,
    expirySec,
  }: {
    userId: string
    username: string
    expirySec: number
  }): Promise<void> {
    await this.#redis.set(`pending-registration:${userId}`, username, {
      expiration: { type: 'EX', value: expirySec },
    })
  }

  async getPendingRegistration(userId: string): Promise<string | undefined> {
    const res = await this.#redis.get(`pending-registration:${userId}`)
    return res ?? undefined
  }

  async deletePendingRegistration(userId: string): Promise<void> {
    await this.#redis.del(`pending-registration:${userId}`)
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
    await this.#redis.set(`refresh-token:${refreshToken}`, userId, {
      expiration: { type: 'EX', value: expirySec },
    })
  }

  async getRefreshToken(refreshToken: string): Promise<string | undefined> {
    const res = await this.#redis.get(`refresh-token:${refreshToken}`)
    return res ?? undefined
  }

  async deleteRefreshToken(refreshToken: string) {
    await this.#redis.del(`refresh-token:${refreshToken}`)
  }
}
