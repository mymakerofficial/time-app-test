import { AuthPersistencePort } from '@/application/port/authPersistencePort.ts'
import { DB } from '@/config/services.ts'
import { eq } from 'drizzle-orm'
import { userPasswords, users } from '@/adapter/db/schema/schema.ts'
import { isUndefined } from '@time-app-test/shared/guards.ts'
import {
  AuthenticationMethodNotFound,
  UserNotFoundByName,
} from '@time-app-test/shared/error/errors.ts'
import {
  CreateUserPasswordData,
  UserPasswordData,
} from '@time-app-test/shared/domain/model/auth.ts'

export class AuthPersistence implements AuthPersistencePort {
  readonly #db: DB

  constructor(container: { db: DB }) {
    this.#db = container.db
  }

  async getPasswordDataByUsername(username: string) {
    const [user] = await this.#db
      .select({
        userId: users.id,
        username: users.username,
        salt: userPasswords.salt,
        verifier: userPasswords.verifier,
      })
      .from(users)
      .leftJoin(userPasswords, eq(users.id, userPasswords.userId))
      .where(eq(users.username, username))
      .limit(1)

    if (isUndefined(user)) {
      throw UserNotFoundByName({ username })
    }

    if (isUndefined(user.salt) || isUndefined(user.verifier)) {
      throw AuthenticationMethodNotFound({ username })
    }

    return user as UserPasswordData
  }

  async createPasswordData(data: CreateUserPasswordData) {
    await this.#db.insert(userPasswords).values(data)
  }
}
