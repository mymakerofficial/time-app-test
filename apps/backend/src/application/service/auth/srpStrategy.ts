import { AuthStrategy } from '@/application/service/auth/authStrategy.ts'
import {
  AuthMethod,
  RegistrationFinishInput,
  RegistrationFinishSuccessDto,
  RegistrationStartInput,
  RegistrationStartSuccessDto,
} from '@time-app-test/shared/model/domain/auth.ts'

export class SrpStrategy implements AuthStrategy {
  async registerStart(
    _: RegistrationStartInput,
  ): Promise<RegistrationStartSuccessDto> {
    return {
      clientData: { method: AuthMethod.Srp },
      cacheData: { method: AuthMethod.Srp },
    }
  }

  async registerFinish({
    clientData,
    cacheData,
  }: RegistrationFinishInput): Promise<RegistrationFinishSuccessDto> {
    if (
      clientData.method !== AuthMethod.Srp ||
      cacheData.method !== AuthMethod.Srp
    ) {
      throw new Error(`AuthMethod did not match, expected '${AuthMethod.Srp}'`)
    }

    return {
      authenticatorData: {
        method: AuthMethod.Srp,
        verifier: clientData.verifier,
        salt: clientData.salt,
      },
    }
  }
}
