import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import { SrpStrategy } from '@/lib/auth/srpStrategy.ts'
import { PasskeyStrategy } from '@/lib/auth/passkeyStrategy.ts'
import { AuthApi, useAuthApi } from '@/lib/auth/api.ts'
import { AuthStrategy } from '@/lib/auth/authStrategy.ts'
import { SessionContext, useSession } from '@/lib/authStore.ts'

export class AuthBase {
  protected api: AuthApi
  protected session: SessionContext

  constructor(api: AuthApi, session: SessionContext) {
    this.api = api
    this.session = session
  }

  getStrategy(method: AuthMethod): AuthStrategy {
    switch (method) {
      case AuthMethod.Srp:
        return new SrpStrategy(this.api, this.session)
      case AuthMethod.Passkey:
        return new PasskeyStrategy(this.api, this.session)
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
  const session = useSession()
  const api = useAuthApi()
  return new AuthBase(api, session)
}
