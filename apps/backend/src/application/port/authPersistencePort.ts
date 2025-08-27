import {
  CreateUserPasswordData,
  UserPasswordData,
} from '@time-app-test/shared/model/domain/auth.ts'

export interface AuthPersistencePort {
  getPasswordDataByUsername(username: string): Promise<UserPasswordData>
  createPasswordData(data: CreateUserPasswordData): Promise<void>
}
