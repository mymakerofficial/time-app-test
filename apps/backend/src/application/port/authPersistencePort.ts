import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import { UserAuthenticatorDto } from '@time-app-test/shared/model/domain/auth/authenticator.ts'
import { EncryptionPublicDto } from '@time-app-test/shared/model/domain/auth/encryption.ts'

export interface AuthPersistencePort {
  getAuthenticators(
    userId: string,
    method: AuthMethod,
  ): Promise<UserAuthenticatorDto[]>
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
