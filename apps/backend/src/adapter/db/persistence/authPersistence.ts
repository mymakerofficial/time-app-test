import { AuthPersistencePort } from '@/application/port/authPersistencePort.ts'
import { DB } from '@/config/services.ts'
import { and, eq } from 'drizzle-orm'
import { userAuthenticators, users } from '@/adapter/db/schema/schema.ts'
import { isUndefined } from '@time-app-test/shared/guards.ts'
import { UserNotFoundByName } from '@time-app-test/shared/error/errors.ts'
import {
  AuthMethod,
  EncryptionPublicDto,
  UserAuthenticatorDto,
} from '@time-app-test/shared/model/domain/auth.ts'

export class AuthPersistence implements AuthPersistencePort {
  readonly #db: DB

  constructor(container: { db: DB }) {
    this.#db = container.db
  }

  async getAuthenticatorByUsername(username: string, method: AuthMethod) {
    const [authenticator] = await this.#db
      .select({
        userId: users.id,
        data: userAuthenticators.data,
        kekSalt: userAuthenticators.kekSalt,
        encryptedDek: userAuthenticators.dek,
      })
      .from(users)
      .leftJoin(userAuthenticators, eq(users.id, userAuthenticators.userId))
      .where(
        and(
          eq(users.username, username),
          eq(userAuthenticators.method, method),
        ),
      )
      .limit(1)

    if (isUndefined(authenticator)) {
      throw UserNotFoundByName({ username })
    }

    return {
      userId: authenticator.userId,
      authenticator: authenticator.data,
      encryption: {
        kekSalt: authenticator.kekSalt,
        encryptedDek: authenticator.encryptedDek,
      },
    }
  }

  async createAuthenticator(
    userId: string,
    data: UserAuthenticatorDto,
    encryption: EncryptionPublicDto,
  ) {
    await this.#db.insert(userAuthenticators).values({
      userId: userId,
      method: data.method,
      data,
      kekSalt: encryption.kekSalt,
      dek: encryption.encryptedDek,
    })
  }
}
