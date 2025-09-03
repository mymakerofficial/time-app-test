import { isUndefined } from '@time-app-test/shared/guards.ts'
import * as srp from 'secure-remote-password/server'
import { nanoid } from 'nanoid'
import {
  InvalidLoginSession,
  InvalidRefreshToken,
  InvalidRegistrationSession,
  NotImplemented,
  UserAlreadyExists,
} from '@time-app-test/shared/error/errors.ts'
import { TokenService } from '@/application/service/tokenService.ts'
import { UserPersistencePort } from '@/application/port/userPersistencePort.ts'
import { AuthCachePort } from '@/application/port/authCachePort.ts'
import { AuthPersistencePort } from '@/application/port/authPersistencePort.ts'
import {
  AuthMethod,
  EncryptionPublicDto,
  PasswordLoginFinishClientData,
  PasswordLoginFinishServerData,
  PasswordLoginStartClientData,
  PasswordLoginStartServerData,
  RegistrationStartClientRequestDto,
  UserPasswordData,
} from '@time-app-test/shared/model/domain/auth.ts'
import * as authn from '@simplewebauthn/server'
import { AuthStrategyFactory } from '@/application/service/auth/factory.ts'
import { UserService } from '@/application/service/userService.ts'

const REFRESH_TOKEN_MAX_AGE_SEC = 604800 // 7 days

export class AuthService {
  readonly #tokenService: TokenService
  readonly #authCache: AuthCachePort
  readonly #authPersistence: AuthPersistencePort
  readonly #userPersistence: UserPersistencePort
  readonly #userService: UserService

  constructor(container: {
    tokenService: TokenService
    authCache: AuthCachePort
    authPersistence: AuthPersistencePort
    userPersistence: UserPersistencePort
    userService: UserService
  }) {
    this.#tokenService = container.tokenService
    this.#authCache = container.authCache
    this.#authPersistence = container.authPersistence
    this.#userPersistence = container.userPersistence
    this.#userService = container.userService
  }

  async registerStart({
    username,
    method,
  }: {
    username: string
    method: AuthMethod
  }) {
    await this.#userService.ensureUsernameDoesNotExist(username)

    const userId = nanoid()

    const { cacheData, clientData } = await AuthStrategyFactory.create(
      method,
    ).registerStart({
      userId,
      username,
    })

    await this.#authCache.setPendingRegistration(userId, cacheData, 60)

    return { userId, auth: clientData }
  }

  async registerFinish({
    username,
    userId,
    auth,
    encryption,
  }: {
    username: string
    userId: string
    auth: RegistrationStartClientRequestDto
    encryption: EncryptionPublicDto
  }) {
    const cacheData = await this.#authCache.getPendingRegistration(userId)

    if (isUndefined(cacheData) || cacheData.method !== auth.method) {
      throw InvalidRegistrationSession({ userId })
    }

    const { authenticatorData } = await AuthStrategyFactory.create(
      auth.method,
    ).registerFinish({
      cacheData,
      clientData: auth,
    })

    await this.#userPersistence.createUser({
      id: userId,
      username,
    })

    await this.#authPersistence.createAuthenticator(
      userId,
      authenticatorData,
      encryption,
    )

    await this.#authCache.deletePendingRegistration(userId)
  }

  async loginStart({
    username,
    clientPublicEphemeral,
  }: PasswordLoginStartClientData): Promise<PasswordLoginStartServerData> {
    const { userId, authenticator, encryption } =
      await this.#authPersistence.getAuthenticatorByUsername(
        username,
        AuthMethod.Srp,
      )

    if (authenticator.method !== AuthMethod.Srp) {
      throw NotImplemented()
    }

    const serverEphemeral = srp.generateEphemeral(authenticator.verifier)

    await this.#authCache.setPendingPasswordLogin({
      userId: user.userId,
      serverSecretEphemeral: serverEphemeral.secret,
      clientPublicEphemeral,
      authSalt: user.authSalt,
      authVerifier: user.authVerifier,
      kekSalt: user.kekSalt,
      encryptedDek: user.encryptedDek,
      expirySec: 60,
    })

    return {
      userId,
      authSalt: authenticator.salt,
      serverPublicEphemeral: serverEphemeral.public,
    }
  }

  async passwordLoginFinish({
    userId,
    clientProof,
  }: PasswordLoginFinishClientData): Promise<PasswordLoginFinishServerData> {
    const pending = await this.#authCache.getPendingPasswordLogin(userId)

    if (isUndefined(pending)) {
      throw InvalidLoginSession({ userId })
    }

    const serverSession = srp.deriveSession(
      pending.serverSecretEphemeral,
      pending.clientPublicEphemeral,
      pending.authSalt,
      userId,
      pending.authVerifier,
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
      expirySec: REFRESH_TOKEN_MAX_AGE_SEC,
    })
    await this.#authCache.deletePendingPasswordLogin(userId)

    return {
      serverProof: serverSession.proof,
      accessToken,
      kekSalt: pending.kekSalt,
      encryptedDek: pending.encryptedDek,
      refreshToken: {
        value: refreshToken,
        maxAge: REFRESH_TOKEN_MAX_AGE_SEC,
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
