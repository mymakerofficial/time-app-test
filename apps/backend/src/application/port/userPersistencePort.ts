import { CreateUser, User, UserAuthMeta } from '@/domain/model/user.ts'

export interface UserPersistencePort {
  createUser(user: CreateUser): Promise<void>
  getUserById(id: string): Promise<User>
  getUserByName(username: string): Promise<User>
  getUserAuthMetaByName(username: string): Promise<UserAuthMeta>
  existsByName(username: string): Promise<boolean>
}
