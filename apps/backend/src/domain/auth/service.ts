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

interface PendingLogin {
  serverSecretEphemeral: string
  clientPublicEphemeral: string
  salt: string
  verifier: string
}

interface PendingRegistration {
  username: string
}

interface RefreshTokens {
  userId: string
  expiresAt: number
}

export class AuthService {
  private static readonly refreshTokenExpiryMs = 1000 * 60 * 60 * 24 * 7 // 7 days

  private static readonly pendingLogins = new Map<string, PendingLogin>()
  private static readonly pendingRegistrations = new Map<
    string,
    PendingRegistration
  >()
  private static readonly refreshTokens = new Map<string, RefreshTokens>()

  readonly #db: DB
  readonly #tokenService: TokenService

  constructor(container: { db: DB; tokenService: TokenService }) {
    this.#db = container.db
    this.#tokenService = container.tokenService
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

    AuthService.pendingRegistrations.set(userId, { username })

    return { userId }
  }

  async registerFinish({
    username,
    userId,
    salt,
    verifier,
  }: AuthModel.RegisterFinishBody) {
    const pending = AuthService.pendingRegistrations.get(userId)

    if (isUndefined(pending) || pending.username !== username) {
      throw InvalidRegistrationSession({ userId })
    }

    await this.#db.insert(users).values({
      id: userId,
      username,
      salt,
      verifier,
    })

    AuthService.pendingRegistrations.delete(userId)
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

    AuthService.pendingLogins.set(user.id, {
      serverSecretEphemeral: serverEphemeral.secret,
      clientPublicEphemeral,
      salt: user.salt,
      verifier: user.verifier,
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
    refreshToken: string
    refreshTokenMaxAge: number
    response: AuthModel.LoginFinishResponse
  }> {
    const pending = AuthService.pendingLogins.get(userId)

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

    AuthService.refreshTokens.set(refreshToken, {
      userId,
      expiresAt: Date.now() + AuthService.refreshTokenExpiryMs,
    })

    AuthService.pendingLogins.delete(userId)

    return {
      refreshToken,
      refreshTokenMaxAge: AuthService.refreshTokenExpiryMs,
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
    const stored = AuthService.refreshTokens.get(refreshToken)

    if (isUndefined(stored) || stored.expiresAt < Date.now()) {
      throw InvalidRefreshToken()
    }

    const accessToken = await this.#tokenService.generateAccessToken({
      userId: stored.userId,
      deviceId: await this.#tokenService.deriveDeviceId(refreshToken),
    })

    return { accessToken }
  }
}
