import { isUndefined } from '@time-app-test/shared/guards.ts'
import * as srp from 'secure-remote-password/server'
import { nanoid } from 'nanoid'
import {
  InvalidLoginSession,
  InvalidRefreshToken,
  InvalidRegistrationSession,
  UserAlreadyExists,
} from '@time-app-test/shared/error/errors.ts'
import { TokenService } from '@/application/service/tokenService.ts'
import { UserPersistencePort } from '@/application/port/userPersistencePort.ts'
import { AuthCachePort } from '@/application/port/authCachePort.ts'
import { AuthPersistencePort } from '@/application/port/authPersistencePort.ts'
import {
  PasswordLoginFinishClientData,
  PasswordLoginFinishServerData,
  PasswordLoginStartClientData,
  PasswordLoginStartServerData,
  UserPasswordData,
} from '@time-app-test/shared/domain/model/auth.ts'

export class AuthService {
  private static readonly refreshTokenExpiryMs = 1000 * 60 * 60 * 24 * 7 // 7 days

  readonly #tokenService: TokenService
  readonly #authCache: AuthCachePort
  readonly #authPersistence: AuthPersistencePort
  readonly #userPersistence: UserPersistencePort

  constructor(container: {
    tokenService: TokenService
    authCache: AuthCachePort
    authPersistence: AuthPersistencePort
    userPersistence: UserPersistencePort
  }) {
    this.#tokenService = container.tokenService
    this.#authCache = container.authCache
    this.#authPersistence = container.authPersistence
    this.#userPersistence = container.userPersistence
  }

  async registerStart({ username }: { username: string }): Promise<{
    userId: string
  }> {
    if (await this.#userPersistence.existsByName(username)) {
      throw UserAlreadyExists({ username })
    }

    const userId = nanoid()

    await this.#authCache.setPendingRegistration({
      userId,
      username,
      expirySec: 60,
    })

    return { userId }
  }

  async registerFinish({ username, userId, salt, verifier }: UserPasswordData) {
    const pendingUsername = await this.#authCache.getPendingRegistration(userId)

    if (pendingUsername !== username) {
      throw InvalidRegistrationSession({ userId })
    }

    await this.#userPersistence.createUser({
      id: userId,
      username,
    })

    await this.#authPersistence.createPasswordData({
      userId,
      salt,
      verifier,
    })

    await this.#authCache.deletePendingRegistration(userId)
  }

  async loginStart({
    username,
    clientPublicEphemeral,
  }: PasswordLoginStartClientData): Promise<PasswordLoginStartServerData> {
    const user = await this.#authPersistence.getPasswordDataByUsername(username)

    const serverEphemeral = srp.generateEphemeral(user.verifier)

    await this.#authCache.setPendingLogin({
      userId: user.userId,
      serverSecretEphemeral: serverEphemeral.secret,
      clientPublicEphemeral,
      salt: user.salt,
      verifier: user.verifier,
      expirySec: 60,
    })

    return {
      userId: user.userId,
      salt: user.salt,
      serverPublicEphemeral: serverEphemeral.public,
    }
  }

  async loginFinish({
    userId,
    clientProof,
  }: PasswordLoginFinishClientData): Promise<PasswordLoginFinishServerData> {
    const pending = await this.#authCache.getPendingLogin(userId)

    if (isUndefined(pending)) {
      throw InvalidLoginSession({ userId })
    }

    const serverSession = srp.deriveSession(
      pending.serverSecretEphemeral,
      pending.clientPublicEphemeral,
      pending.salt,
      userId,
      pending.verifier,
      clientProof,
    )

    const refreshToken = this.#tokenService.generateRefreshToken()
    const accessToken = await this.#tokenService.generateAccessToken({
      userId,
      deviceId: await this.#tokenService.deriveDeviceId(refreshToken),
    })
    await this.#authCache.setRefreshToken({
      refreshToken,
      userId,
      expirySec: AuthService.refreshTokenExpiryMs / 1000,
    })
    await this.#authCache.deletePendingLogin(userId)

    return {
      serverProof: serverSession.proof,
      accessToken,
      refreshToken: {
        value: refreshToken,
        maxAge: AuthService.refreshTokenExpiryMs,
      },
    }
  }

  async getAccessTokenWithRefreshToken({
    refreshToken,
  }: {
    refreshToken: string
  }): Promise<{
    accessToken: string
  }> {
    const userId = await this.#authCache.getRefreshToken(refreshToken)

    if (isUndefined(userId)) {
      throw InvalidRefreshToken()
    }

    const accessToken = await this.#tokenService.generateAccessToken({
      userId,
      deviceId: await this.#tokenService.deriveDeviceId(refreshToken),
    })

    return { accessToken }
  }
}
