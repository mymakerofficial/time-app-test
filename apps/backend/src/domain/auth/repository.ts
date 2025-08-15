import { RedisClientType } from 'redis'
import { isNull } from '@time-app-test/shared/guards.ts'

interface PendingLogin {
  serverSecretEphemeral: string
  clientPublicEphemeral: string
  salt: string
  verifier: string
}

export interface AuthRepository {
  setPendingLogin(
    options: {
      userId: string
      expirySec: number
    } & PendingLogin,
  ): Promise<void>
  getPendingLogin(userId: string): Promise<PendingLogin | undefined>
  deletePendingLogin(userId: string): Promise<void>
  setPendingRegistration(options: {
    userId: string
    username: string
    expirySec: number
  }): Promise<void>
  getPendingRegistration(userId: string): Promise<string | undefined>
  deletePendingRegistration(userId: string): Promise<void>
  setRefreshToken(options: {
    refreshToken: string
    userId: string
    expirySec: number
  }): Promise<void>
  getRefreshToken(refreshToken: string): Promise<string | undefined>
  deleteRefreshToken(refreshToken: string): Promise<void>
}

export class RedisAuthRepository implements AuthRepository {
  readonly #redis: RedisClientType

  constructor({ redis }: { redis: RedisClientType }) {
    this.#redis = redis
  }

  async setPendingLogin({
    userId,
    expirySec,
    serverSecretEphemeral,
    clientPublicEphemeral,
    salt,
    verifier,
  }: {
    userId: string
    expirySec: number
  } & PendingLogin): Promise<void> {
    await this.#redis.hSetEx(
      `pending-login:${userId}`,
      {
        sse: serverSecretEphemeral,
        cpe: clientPublicEphemeral,
        slt: salt,
        ver: verifier,
      },
      {
        expiration: { type: 'EX', value: expirySec },
      },
    )
  }

  async getPendingLogin(userId: string) {
    const [serverSecretEphemeral, clientPublicEphemeral, salt, verifier] =
      await this.#redis.hmGet(`pending-login:${userId}`, [
        'sse',
        'cpe',
        'slt',
        'ver',
      ])
    if (
      isNull(serverSecretEphemeral) ||
      isNull(clientPublicEphemeral) ||
      isNull(salt) ||
      isNull(verifier)
    ) {
      return undefined
    }
    return {
      serverSecretEphemeral,
      clientPublicEphemeral,
      salt,
      verifier,
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
