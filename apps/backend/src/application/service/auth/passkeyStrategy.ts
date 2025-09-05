import { AuthStrategy } from '@/application/service/auth/authStrategy.ts'
import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import * as authn from '@simplewebauthn/server'
import {
  AuthMethodDidNotMatch,
  PasskeyVerificationFailed,
} from '@time-app-test/shared/error/errors.ts'
import { isUndefined } from '@time-app-test/shared/guards.ts'
import { uint8ToHex } from '@time-app-test/shared/helper/binary.ts'
import { RegistrationStart } from '@time-app-test/shared/model/domain/auth/registrationStart.ts'
import { RegistrationFinish } from '@time-app-test/shared/model/domain/auth/registrationFinish.ts'
import { LoginStart } from '@time-app-test/shared/model/domain/auth/loginStart.ts'
import { UserAuthenticatorWithId } from '@time-app-test/shared/model/domain/auth/authenticator.ts'
import { LoginFinish } from '@time-app-test/shared/model/domain/auth/loginFinish.ts'
import { Prettify2 } from '@time-app-test/shared/types.ts'

// Passkey config
// TODO make configurable

const RP_NAME = 'Test App'
const RP_ID = 'localhost'
const ORIGIN = `http://${RP_ID}:3000`

export class PasskeyStrategy implements AuthStrategy {
  async registerStart({
    userId,
    username,
  }: RegistrationStart.StrategyInputDto): Promise<RegistrationStart.StrategyResultDto> {
    const options = await authn.generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: new TextEncoder().encode(userId),
      userName: username,
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        residentKey: 'required',
        userVerification: 'preferred',
      },
    })

    return {
      clientData: { method: AuthMethod.Passkey, options },
      cacheData: { method: AuthMethod.Passkey, challenge: options.challenge },
    }
  }

  async registerFinish({
    clientData,
    cacheData,
  }: RegistrationFinish.StrategyInputDto): Promise<RegistrationFinish.StrategyResultDto> {
    if (
      clientData.method !== AuthMethod.Passkey ||
      cacheData.method !== AuthMethod.Passkey
    ) {
      throw AuthMethodDidNotMatch({ expected: AuthMethod.Passkey })
    }

    const { verified, registrationInfo } =
      await authn.verifyRegistrationResponse({
        response: clientData.response,
        expectedChallenge: cacheData.challenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        requireUserVerification: true,
      })

    if (!verified || isUndefined(registrationInfo)) {
      throw PasskeyVerificationFailed()
    }

    return {
      authenticatorData: {
        method: AuthMethod.Passkey,
        id: registrationInfo.credential.id,
        publicKey: uint8ToHex(registrationInfo.credential.publicKey),
        counter: registrationInfo.credential.counter,
        transports: registrationInfo.credential.transports,
      },
    }
  }

  async loginStart({
    clientData,
    authenticators,
  }: LoginStart.StrategyInputDto): Promise<LoginStart.StrategyResultDto> {
    if (
      clientData.method !== AuthMethod.Passkey ||
      !arePasskeyAuthenticators(authenticators)
    ) {
      throw AuthMethodDidNotMatch({ expected: AuthMethod.Passkey })
    }

    const options = await authn.generateAuthenticationOptions({
      rpID: RP_ID,
      allowCredentials: authenticators.map(({ data }) => ({
        id: data.id,
        type: 'public-key',
        transports: data.transports,
      })),
      userVerification: 'preferred',
    })

    return {
      clientData: { method: AuthMethod.Passkey, options },
      cacheData: {
        method: AuthMethod.Passkey,
        challenge: options.challenge,
        authenticators,
      },
    }
  }

  async loginFinish({
    clientData,
    cacheData,
  }: LoginFinish.StrategyInputDto): Promise<LoginFinish.StrategyResultDto> {
    if (
      clientData.method !== AuthMethod.Passkey ||
      cacheData.method !== AuthMethod.Passkey ||
      !arePasskeyAuthenticators(cacheData.authenticators)
    ) {
      throw AuthMethodDidNotMatch({ expected: AuthMethod.Passkey })
    }

    const authenticator = cacheData.authenticators.find(
      (auth) => auth.data.id === clientData.response.id,
    )

    if (isUndefined(authenticator)) {
      throw PasskeyVerificationFailed()
    }

    const { verified, authenticationInfo } =
      await authn.verifyAuthenticationResponse({
        response: clientData.response,
        expectedChallenge: cacheData.challenge,
        expectedOrigin: ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: authenticator.data.id,
          publicKey: new TextEncoder().encode(authenticator.data.publicKey),
          counter: authenticator.data.counter,
          transports: authenticator.data.transports,
        },
        requireUserVerification: true,
      })

    if (!verified || isUndefined(authenticationInfo)) {
      throw PasskeyVerificationFailed()
    }

    return {
      clientData: { method: AuthMethod.Passkey },
      updatedAuthenticator: {
        id: authenticator.id,
        data: {
          ...authenticator.data,
          counter: authenticationInfo.newCounter,
        },
      },
    }
  }
}

function arePasskeyAuthenticators(
  authenticators: UserAuthenticatorWithId[],
): authenticators is Prettify2<
  UserAuthenticatorWithId & {
    data: {
      method: 'PASSKEY'
    }
  }
>[] {
  return !authenticators.some((it) => it.data.method !== AuthMethod.Passkey)
}
