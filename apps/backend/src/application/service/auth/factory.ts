import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import { SrpStrategy } from '@/application/service/auth/srpStrategy.ts'
import { PasskeyStrategy } from '@/application/service/auth/passkeyStrategy.ts'

export class AuthStrategyFactory {
  static create(method: AuthMethod) {
    switch (method) {
      case AuthMethod.Srp:
        return new SrpStrategy()
      case AuthMethod.Passkey:
        return new PasskeyStrategy()
    }
  }
}
