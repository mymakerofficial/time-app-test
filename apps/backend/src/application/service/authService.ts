import { isUndefined } from '@time-app-test/shared/guards.ts'
import * as srp from 'secure-remote-password/server'
import { nanoid } from 'nanoid'
import {
  InvalidLoginSession,
  InvalidRefreshToken,
  InvalidRegistrationSession,
  NotImplemented,
} from '@time-app-test/shared/error/errors.ts'
import { TokenService } from '@/application/service/tokenService.ts'
import { UserPersistencePort } from '@/application/port/userPersistencePort.ts'
import { AuthCachePort } from '@/application/port/authCachePort.ts'
import { AuthPersistencePort } from '@/application/port/authPersistencePort.ts'
import {
  AuthMethod,
  PasswordLoginFinishClientData,
  PasswordLoginFinishServerData,
} from '@time-app-test/shared/model/domain/auth.ts'
import { AuthStrategyFactory } from '@/application/service/auth/factory.ts'
import { UserService } from '@/application/service/userService.ts'
import { LoginStart } from '@time-app-test/shared/model/domain/auth/loginStart.ts'
import { RegistrationFinish } from '@time-app-test/shared/model/domain/auth/registrationFinish.ts'
import { RegistrationStart } from '@time-app-test/shared/model/domain/auth/registrationStart.ts'

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
  }: RegistrationStart.ConcreteInputDto): Promise<RegistrationStart.ConcreteResultDto> {
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
  }: RegistrationFinish.ConcreteInputDto) {
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
    auth,
  }: LoginStart.ConcreteInputDto): Promise<LoginStart.ConcreteResultDto> {
    const user = await this.#userPersistence.getUserByName(username)
    const authenticators = await this.#authPersistence.getAuthenticators(
      user.id,
      auth.method,
    )

    const { cacheData, clientData } = await AuthStrategyFactory.create(
      auth.method,
    ).loginStart({
      clientData: auth,
      authenticators,
    })

    await this.#authCache.setPendingPasswordLogin(user.id, cacheData, 60)

    return {
      userId: user.id,
      auth: clientData,
    }
  }

  async loginFinish({
    userId,
    clientProof,
  }: PasswordLoginFinishClientData): Promise<PasswordLoginFinishServerData> {
    const pending = await this.#authCache.getPendingPasswordLogin(userId)

    if (isUndefined(pending)) {
      throw InvalidLoginSession({ userId })
    }

    if (pending.method !== AuthMethod.Srp) {
      throw NotImplemented()
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
      expirySec: REFRESH_TOKEN_MAX_AGE_SEC,
    })
    await this.#authCache.deletePendingPasswordLogin(userId)

    const encryption = await this.#authPersistence.getEncryptionByUserId(
      userId,
      AuthMethod.Srp,
    )

    return {
      serverProof: serverSession.proof,
      accessToken,
      ...encryption,
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
