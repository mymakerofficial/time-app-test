export interface PendingLogin {
  serverSecretEphemeral: string
  clientPublicEphemeral: string
  authSalt: string
  authVerifier: string
  kekSalt: string
  encryptedDek: string
}

export interface AuthCachePort {
  setPendingLogin(
    options: {
      userId: string
      expirySec: number
    } & PendingLogin,
  ): Promise<void>

  getPendingLogin(userId: string): Promise<PendingLogin | undefined>

  deletePendingLogin(userId: string): Promise<void>

  setPendingRegistration(options: {
    userId: string
    username: string
    expirySec: number
  }): Promise<void>

  getPendingRegistration(userId: string): Promise<string | undefined>

  deletePendingRegistration(userId: string): Promise<void>

  setRefreshToken(options: {
    refreshToken: string
    userId: string
    expirySec: number
  }): Promise<void>

  getRefreshToken(refreshToken: string): Promise<string | undefined>

  deleteRefreshToken(refreshToken: string): Promise<void>
}
