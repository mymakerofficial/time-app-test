// TODO extract to shared model
import { RegistrationCacheDto } from '@time-app-test/shared/model/domain/auth.ts'

export interface PendingLogin {
  serverSecretEphemeral: string
  clientPublicEphemeral: string
  authSalt: string
  authVerifier: string
  kekSalt: string
  encryptedDek: string
}

export interface AuthCachePort {
  setPendingPasswordLogin(
    options: {
      userId: string
      expirySec: number
    } & PendingLogin,
  ): Promise<void>

  getPendingPasswordLogin(userId: string): Promise<PendingLogin | undefined>

  deletePendingPasswordLogin(userId: string): Promise<void>

  setPendingRegistration(
    userId: string,
    data: RegistrationCacheDto,
    expirySec: number,
  ): Promise<void>

  getPendingRegistration(
    userId: string,
  ): Promise<RegistrationCacheDto | undefined>

  deletePendingRegistration(userId: string): Promise<void>

  setRefreshToken(options: {
    refreshToken: string
    userId: string
    expirySec: number
  }): Promise<void>

  getRefreshToken(refreshToken: string): Promise<string | undefined>

  deleteRefreshToken(refreshToken: string): Promise<void>
}
