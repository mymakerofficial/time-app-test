import { Elysia } from 'elysia'
import { db } from '@/index.ts'
import { BaseServiceContext, Service } from '@/lib/service.ts'
import { AuthModel } from '@/modules/auth/model.ts'
import { isUndefined } from '@time-app-test/shared/guards.ts'
import { apiError } from '@time-app-test/shared/error/apiError.ts'
import * as srp from 'secure-remote-password/server'

export class AuthService extends Service {
  private static pendingLogins = new Map<
    string,
    {
      serverSecretEphemeral: string
      clientPublicEphemeral: string
      salt: string
      verifier: string
    }
  >()

  constructor(context: BaseServiceContext) {
    super(context)
  }

  async loginStart({
    username,
    clientPublicEphemeral,
  }: AuthModel.loginStartBody): Promise<AuthModel.loginStartResponse> {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username),
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
}

export const authService = new Elysia({
  name: 'authService',
}).derive({ as: 'global' }, (context) => ({
  authService: new AuthService(context),
}))
