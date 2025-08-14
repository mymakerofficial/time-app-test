import { AuthModel } from '@/modules/auth/model.ts'
import { isDefined, isUndefined } from '@time-app-test/shared/guards.ts'
import { apiError } from '@time-app-test/shared/error/apiError.ts'
import * as srp from 'secure-remote-password/server'
import { JwtService } from '@/modules/jwt/service.ts'
import * as crypto from 'node:crypto'
import { users } from '@/db/schema/schema.ts'
import { eq, or } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { DB } from '@/services.ts'

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
  readonly #jwtService: JwtService

  constructor(container: { db: DB; jwtService: JwtService }) {
    this.#db = container.db
    this.#jwtService = container.jwtService
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
      throw apiError({
        message: `User with username "${username}" already exists`,
        errorCode: 'USER_ALREADY_EXISTS',
      })
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
      throw apiError({
        errorCode: 'INVALID_REGISTRATION',
        message: 'User registration not found or invalid',
      })
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
      throw apiError({
        message: `User with username "${username}" does not exist`,
        errorCode: 'USER_NOT_FOUND',
        statusCode: 404,
      })
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
      throw apiError({
        message: `User with id "${userId}" does not have a pending login.`,
        errorCode: 'INVALID_LOGIN',
        statusCode: 401,
      })
    }

    const serverSession = srp.deriveSession(
      pending.serverSecretEphemeral,
      pending.clientPublicEphemeral,
      pending.salt,
      userId,
      pending.verifier,
      clientProof,
    )

    const accessToken = await this.#jwtService.generateAccessToken({ userId })

    const refreshToken = crypto.randomBytes(32).toString('hex')
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
}
