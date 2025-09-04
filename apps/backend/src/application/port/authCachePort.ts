import { RegistrationCacheDto } from '@time-app-test/shared/model/domain/auth/registrationCache.ts'
import { LoginCacheDto } from '@time-app-test/shared/model/domain/auth/loginCache.ts'

export interface AuthCachePort {
  setPendingPasswordLogin(
    userId: string,
    data: LoginCacheDto,
    expirySec: number,
  ): Promise<void>

  getPendingPasswordLogin(userId: string): Promise<LoginCacheDto | undefined>

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
