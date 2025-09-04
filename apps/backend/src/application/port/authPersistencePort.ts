import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import {
  UserAuthenticatorDto,
  UserAuthenticatorUserId,
} from '@time-app-test/shared/model/domain/auth/authenticator.ts'
import { EncryptionPublicDto } from '@time-app-test/shared/model/domain/auth/encryption.ts'

export interface AuthPersistencePort {
  getAuthenticatorByUsername(
    username: string,
    method: AuthMethod,
  ): Promise<UserAuthenticatorUserId>
  createAuthenticator(
    userId: string,
    data: UserAuthenticatorDto,
    encryption: EncryptionPublicDto,
  ): Promise<void>
  getEncryptionByUserId(
    userId: string,
    method: AuthMethod,
  ): Promise<EncryptionPublicDto>
}
