import { AuthModel } from '@/adapter/rest/auth/model.ts'
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

export class AuthService {
  private static readonly refreshTokenExpiryMs = 1000 * 60 * 60 * 24 * 7 // 7 days

  readonly #tokenService: TokenService
  readonly #authCache: AuthCachePort
  readonly #userPersistence: UserPersistencePort

  constructor(container: {
    tokenService: TokenService
    authCache: AuthCachePort
    userPersistence: UserPersistencePort
  }) {
    this.#tokenService = container.tokenService
    this.#authCache = container.authCache
    this.#userPersistence = container.userPersistence
  }

  async registerStart({
    username,
  }: AuthModel.RegisterStartBody): Promise<AuthModel.RegisterStartResponse> {
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

  async registerFinish({
    username,
    userId,
    salt,
    verifier,
  }: AuthModel.RegisterFinishBody) {
    const pendingUsername = await this.#authCache.getPendingRegistration(userId)

    if (pendingUsername !== username) {
      throw InvalidRegistrationSession({ userId })
    }

    await this.#userPersistence.createUser({
      id: userId,
      username,
      salt,
      verifier,
    })

    await this.#authCache.deletePendingRegistration(userId)
  }

  async loginStart({
    username,
    clientPublicEphemeral,
  }: AuthModel.LoginStartBody): Promise<AuthModel.LoginStartResponse> {
    const user = await this.#userPersistence.getUserAuthMetaByName(username)

    const serverEphemeral = srp.generateEphemeral(user.verifier)

    await this.#authCache.setPendingLogin({
      userId: user.id,
      serverSecretEphemeral: serverEphemeral.secret,
      clientPublicEphemeral,
      salt: user.salt,
      verifier: user.verifier,
      expirySec: 60,
    })

    return {
      userId: user.id,
      salt: user.salt,
      serverPublicEphemeral: serverEphemeral.public,
    }
  }

  async loginFinish({
    userId,
    clientProof,
  }: AuthModel.LoginFinishBody): Promise<{
    cookie: {
      value: string
      maxAge: number
    }
    response: AuthModel.LoginFinishResponse
  }> {
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
      cookie: {
        value: refreshToken,
        maxAge: AuthService.refreshTokenExpiryMs,
      },
      response: {
        serverProof: serverSession.proof,
        accessToken,
      },
    }
  }

  async getAccessTokenWithRefreshToken({
    refreshToken,
  }: {
    refreshToken: string
  }): Promise<AuthModel.GetTokenResponse> {
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
