import { AuthPersistencePort } from '@/application/port/authPersistencePort.ts'
import { DB } from '@/config/services.ts'
import { and, eq } from 'drizzle-orm'
import { userAuthenticators } from '@/adapter/db/schema/schema.ts'
import { isUndefined } from '@time-app-test/shared/guards.ts'
import { AuthenticationMethodNotFound } from '@time-app-test/shared/error/errors.ts'
import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import { UserAuthenticatorDto } from '@time-app-test/shared/model/domain/auth/authenticator.ts'
import { EncryptionPublicDto } from '@time-app-test/shared/model/domain/auth/encryption.ts'

export class AuthPersistence implements AuthPersistencePort {
  readonly #db: DB

  constructor(container: { db: DB }) {
    this.#db = container.db
  }

  async getAuthenticators(userId: string, method: AuthMethod) {
    const authenticators = await this.#db
      .select({
        data: userAuthenticators.data,
      })
      .from(userAuthenticators)
      .where(
        and(
          eq(userAuthenticators.userId, userId),
          eq(userAuthenticators.method, method),
        ),
      )

    if (authenticators.length === 0) {
      throw AuthenticationMethodNotFound({ userId, method })
    }

    return authenticators.map((it) => it.data)
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

  async getEncryptionByUserId(
    userId: string,
    method: AuthMethod,
  ): Promise<EncryptionPublicDto> {
    const [encryption] = await this.#db
      .select({
        kekSalt: userAuthenticators.kekSalt,
        encryptedDek: userAuthenticators.dek,
      })
      .from(userAuthenticators)
      .where(
        and(
          eq(userAuthenticators.userId, userId),
          eq(userAuthenticators.method, method),
        ),
      )
      .limit(1)

    if (isUndefined(encryption)) {
      throw AuthenticationMethodNotFound({ userId, method })
    }

    return encryption
  }
}
