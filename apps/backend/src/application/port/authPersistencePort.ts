import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import {
  UserAuthenticatorDto,
  UserAuthenticatorWithId,
} from '@time-app-test/shared/model/domain/auth/authenticator.ts'
import { EncryptionPublicDto } from '@time-app-test/shared/model/domain/auth/encryption.ts'

export interface AuthPersistencePort {
  getAuthenticators(
    userId: string,
    method: AuthMethod,
  ): Promise<UserAuthenticatorWithId[]>
  createAuthenticator(
    userId: string,
    data: UserAuthenticatorDto,
    encryption: EncryptionPublicDto,
  ): Promise<void>
  getEncryptionByUserId(
    userId: string,
    method: AuthMethod,
  ): Promise<EncryptionPublicDto>
  updateAuthenticator(id: string, data: UserAuthenticatorDto): Promise<void>
}
