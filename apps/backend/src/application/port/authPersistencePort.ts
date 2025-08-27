import {
  CreateUserPasswordData,
  UserPasswordData,
} from '@time-app-test/shared/domain/model/auth.ts'

export interface AuthPersistencePort {
  getPasswordDataByUsername(username: string): Promise<UserPasswordData>
  createPasswordData(data: CreateUserPasswordData): Promise<void>
}
