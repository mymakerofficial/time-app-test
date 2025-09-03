import { AuthStrategy } from '@/application/service/auth/authStrategy.ts'
import {
  AuthMethod,
  RegistrationFinishInput,
  RegistrationFinishSuccessDto,
  RegistrationStartInput,
  RegistrationStartSuccessDto,
} from '@time-app-test/shared/model/domain/auth.ts'
import * as authn from '@simplewebauthn/server'
import { PasskeyRegistrationVerificationFailed } from '@time-app-test/shared/error/errors.ts'
import { isUndefined } from '@time-app-test/shared/guards.ts'
import { uint8ToHex } from '@time-app-test/shared/helper/binary.ts'

// Passkey config
// TODO make configurable

const RP_NAME = 'Test App'
const RP_ID = 'localhost'
const ORIGIN = `http://${RP_ID}:3000`

export class PasskeyStrategy implements AuthStrategy {
  async registerStart({
    userId,
    username,
  }: RegistrationStartInput): Promise<RegistrationStartSuccessDto> {
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
  }: RegistrationFinishInput): Promise<RegistrationFinishSuccessDto> {
    if (
      clientData.method !== AuthMethod.Passkey ||
      cacheData.method !== AuthMethod.Passkey
    ) {
      throw new Error(
        `AuthMethod did not match, expected '${AuthMethod.Passkey}'`,
      )
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
      throw PasskeyRegistrationVerificationFailed()
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
}
