import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import { SrpStrategy } from '@/lib/application/auth/srpStrategy.ts'
import { PasskeyStrategy } from '@/lib/application/auth/passkeyStrategy.ts'
import { AuthApi } from '@/lib/application/auth/api.ts'
import { AuthStrategy } from '@/lib/application/auth/authStrategy.ts'
import { SessionContext } from '@/lib/application/session/sessionStore.ts'
import { BaseService } from '@/lib/application/base/baseService.ts'

export abstract class BaseAuthService extends BaseService {
  protected readonly authApi: AuthApi

  constructor(container: { authApi: AuthApi; session: SessionContext }) {
    super(container)
    this.authApi = container.authApi
  }
}

export class AuthService extends BaseAuthService {
  getStrategy(method: AuthMethod): AuthStrategy {
    switch (method) {
      case AuthMethod.Srp:
        return new SrpStrategy({ authApi: this.authApi, session: this.session })
      case AuthMethod.Passkey:
        return new PasskeyStrategy({
          authApi: this.authApi,
          session: this.session,
        })
    }
  }

  async getToken() {
    return await this.authApi.getToken()
  }

  async logout() {
    return await this.authApi.logout()
  }
}
