import { UserPersistencePort } from '@/application/port/userPersistencePort.ts'
import { UserAlreadyExists } from '@time-app-test/shared/error/errors.ts'

export class UserService {
  readonly #userPersistence: UserPersistencePort

  constructor(container: { userPersistence: UserPersistencePort }) {
    this.#userPersistence = container.userPersistence
  }

  async ensureUsernameDoesNotExist(username: string) {
    if (await this.#userPersistence.existsByName(username)) {
      throw UserAlreadyExists({ username })
    }
  }
}
