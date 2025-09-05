import { AuthStrategy } from '@/application/service/auth/authStrategy.ts'
import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import * as srp from 'secure-remote-password/server'
import { RegistrationStart } from '@time-app-test/shared/model/domain/auth/registrationStart.ts'
import { RegistrationFinish } from '@time-app-test/shared/model/domain/auth/registrationFinish.ts'
import { LoginStart } from '@time-app-test/shared/model/domain/auth/loginStart.ts'
import { AuthMethodDidNotMatch } from '@time-app-test/shared/error/errors.ts'
import { LoginFinish } from '@time-app-test/shared/model/domain/auth/loginFinish.ts'

export class SrpStrategy implements AuthStrategy {
  async registerStart(
    _: RegistrationStart.StrategyInputDto,
  ): Promise<RegistrationStart.StrategyResultDto> {
    return {
      clientData: { method: AuthMethod.Srp },
      cacheData: { method: AuthMethod.Srp },
    }
  }

  async registerFinish({
    clientData,
    cacheData,
  }: RegistrationFinish.StrategyInputDto): Promise<RegistrationFinish.StrategyResultDto> {
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
    authenticators: [{ data: authenticator }],
  }: LoginStart.StrategyInputDto): Promise<LoginStart.StrategyResultDto> {
    if (
      clientData.method !== AuthMethod.Srp ||
      authenticator.method !== AuthMethod.Srp
    ) {
      throw AuthMethodDidNotMatch({ expected: AuthMethod.Srp })
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

  async loginFinish({
    userId,
    clientData,
    cacheData,
  }: LoginFinish.StrategyInputDto): Promise<LoginFinish.StrategyResultDto> {
    if (
      clientData.method !== AuthMethod.Srp ||
      cacheData.method !== AuthMethod.Srp
    ) {
      throw AuthMethodDidNotMatch({ expected: AuthMethod.Srp })
    }

    const serverSession = srp.deriveSession(
      cacheData.serverSecretEphemeral,
      cacheData.clientPublicEphemeral,
      cacheData.salt,
      userId,
      cacheData.verifier,
      clientData.clientProof,
    )

    return {
      clientData: { method: AuthMethod.Srp, serverProof: serverSession.proof },
    }
  }
}
