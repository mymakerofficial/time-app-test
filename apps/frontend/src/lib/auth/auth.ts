import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import { SrpStrategy } from '@/lib/auth/srpStrategy.ts'
import { PasskeyStrategy } from '@/lib/auth/passkeyStrategy.ts'
import { AuthApi, useAuthApi } from '@/lib/auth/api.ts'
import { AuthStrategy } from '@/lib/auth/authStrategy.ts'

export class AuthBase {
  protected api: AuthApi

  constructor(api: AuthApi) {
    this.api = api
  }

  getStrategy(method: AuthMethod): AuthStrategy {
    switch (method) {
      case AuthMethod.Srp:
        return new SrpStrategy(this.api)
      case AuthMethod.Passkey:
        return new PasskeyStrategy(this.api)
    }
  }

  async getToken() {
    return await this.api.getToken()
  }

  async logout() {
    return await this.api.logout()
  }
}

export function useAuth() {
  const api = useAuthApi()
  return new AuthBase(api)
}
