import { DB } from '@/config/services.ts'
import { eq, SQL } from 'drizzle-orm'
import { users } from '@/adapter/db/schema/schema.ts'
import { isDefined, isUndefined } from '@time-app-test/shared/guards.ts'
import {
  UserNotFoundById,
  UserNotFoundByName,
} from '@time-app-test/shared/error/errors.ts'
import { UserPersistencePort } from '@/application/port/userPersistencePort.ts'
import { CreateUser } from '@time-app-test/shared/domain/model/user.ts'

export class UserPersistence implements UserPersistencePort {
  readonly #db: DB

  constructor(container: { db: DB }) {
    this.#db = container.db
  }

  #getUserQuery({ where }: { where: SQL }) {
    return this.#db.query.users.findFirst({
      where,
      columns: {
        id: true,
        username: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  async createUser(user: CreateUser) {
    await this.#db.insert(users).values(user)
  }

  async getUserById(id: string) {
    const user = await this.#getUserQuery({
      where: eq(users.id, id),
    })

    if (isUndefined(user)) {
      throw UserNotFoundById({ id })
    }

    return user
  }

  async getUserByName(username: string) {
    const user = await this.#getUserQuery({
      where: eq(users.username, username),
    })

    if (isUndefined(user)) {
      throw UserNotFoundByName({ username })
    }

    return user
  }

  async existsByName(username: string) {
    const user = await this.#db.query.users.findFirst({
      where: eq(users.username, username),
      columns: { id: true },
    })

    return isDefined(user)
  }
}
