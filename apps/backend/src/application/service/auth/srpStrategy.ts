import { AuthStrategy } from '@/application/service/auth/authStrategy.ts'
import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import { NotImplemented } from '@time-app-test/shared/error/errors.ts'
import * as srp from 'secure-remote-password/server'
import {
  RegistrationStartInput,
  RegistrationStartSuccessDto,
} from '@time-app-test/shared/model/domain/auth/registrationStart.ts'
import {
  RegistrationFinishInput,
  RegistrationFinishSuccessDto,
} from '@time-app-test/shared/model/domain/auth/registrationFinish.ts'
import {
  LoginStartInput,
  LoginStartSuccessDto,
} from '@time-app-test/shared/model/domain/loginStart.ts'

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

  async loginStart({
    clientData,
    authenticator,
  }: LoginStartInput): Promise<LoginStartSuccessDto> {
    if (
      clientData.method !== AuthMethod.Srp ||
      authenticator.method !== AuthMethod.Srp
    ) {
      throw new Error(`AuthMethod did not match, expected '${AuthMethod.Srp}'`)
    }

    const serverEphemeral = srp.generateEphemeral(authenticator.verifier)

    return {
      cacheData: {
        ...authenticator,
        serverSecretEphemeral: serverEphemeral.secret,
        clientPublicEphemeral: clientData.clientPublicEphemeral,
      },
      clientData: {
        method: AuthMethod.Srp,
        salt: authenticator.salt,
        serverPublicEphemeral: serverEphemeral.public,
      },
    }
  }
}
