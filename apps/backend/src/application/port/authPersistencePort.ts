import {
  AuthMethod,
  EncryptionPublicDto,
  UserAuthenticatorDto,
  UserAuthenticatorWithEncryption,
} from '@time-app-test/shared/model/domain/auth.ts'

export interface AuthPersistencePort {
  getAuthenticatorByUsername(
    username: string,
    method: AuthMethod,
  ): Promise<UserAuthenticatorWithEncryption>
  createAuthenticator(
    userId: string,
    data: UserAuthenticatorDto,
    encryption: EncryptionPublicDto,
  ): Promise<void>
}
