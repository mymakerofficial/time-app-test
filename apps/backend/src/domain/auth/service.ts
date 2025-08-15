import { AuthModel } from '@/domain/auth/model.ts'
import { isDefined, isUndefined } from '@time-app-test/shared/guards.ts'
import * as srp from 'secure-remote-password/server'
import { users } from '@/db/schema/schema.ts'
import { eq, or } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { DB } from '@/services.ts'
import {
  InvalidLoginSession,
  InvalidRefreshToken,
  InvalidRegistrationSession,
  UserAlreadyExists,
  UserNotFoundByName,
} from '@time-app-test/shared/error/errors.ts'
import { TokenService } from '@/domain/token/service.ts'
import { AuthRepository } from '@/domain/auth/repository.ts'

export class AuthService {
  private static readonly refreshTokenExpiryMs = 1000 * 60 * 60 * 24 * 7 // 7 days

  readonly #db: DB
  readonly #tokenService: TokenService
  readonly #authRepository: AuthRepository

  constructor(container: {
    db: DB
    tokenService: TokenService
    authRepository: AuthRepository
  }) {
    this.#db = container.db
    this.#tokenService = container.tokenService
    this.#authRepository = container.authRepository
  }

  async registerStart({
    username,
  }: AuthModel.RegisterStartBody): Promise<AuthModel.RegisterStartResponse> {
    const userId = nanoid()

    const existing = await this.#db.query.users.findFirst({
      where: or(eq(users.username, username), eq(users.id, userId)),
      columns: {
        id: true,
      },
    })

    if (isDefined(existing)) {
      throw UserAlreadyExists({ username })
    }

    await this.#authRepository.setPendingRegistration({
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
    const pendingUsername =
      await this.#authRepository.getPendingRegistration(userId)

    if (pendingUsername !== username) {
      throw InvalidRegistrationSession({ userId })
    }

    await this.#db.insert(users).values({
      id: userId,
      username,
      salt,
      verifier,
    })

    await this.#authRepository.deletePendingRegistration(userId)
  }

  async loginStart({
    username,
    clientPublicEphemeral,
  }: AuthModel.LoginStartBody): Promise<AuthModel.LoginStartResponse> {
    const user = await this.#db.query.users.findFirst({
      where: eq(users.username, username),
      columns: {
        id: true,
        salt: true,
        verifier: true,
      },
    })

    if (isUndefined(user)) {
      throw UserNotFoundByName({ username })
    }

    const serverEphemeral = srp.generateEphemeral(user.verifier)

    await this.#authRepository.setPendingLogin({
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
    const pending = await this.#authRepository.getPendingLogin(userId)

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
    await this.#authRepository.setRefreshToken({
      refreshToken,
      userId,
      expirySec: AuthService.refreshTokenExpiryMs / 1000,
    })

    await this.#authRepository.deletePendingLogin(userId)

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
    const userId = await this.#authRepository.getRefreshToken(refreshToken)

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
