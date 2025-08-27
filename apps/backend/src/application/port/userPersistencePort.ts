import { CreateUser, User } from '@time-app-test/shared/model/domain/user.ts'

export interface UserPersistencePort {
  createUser(user: CreateUser): Promise<void>
  getUserById(id: string): Promise<User>
  getUserByName(username: string): Promise<User>
  existsByName(username: string): Promise<boolean>
}
