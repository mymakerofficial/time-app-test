import { AuthStrategy, LoginResult } from '@/lib/auth/authStrategy.ts'
import { LoginFormValues, RegisterFormValues } from '@/lib/schema/form.ts'
import * as authn from '@simplewebauthn/browser'
import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import {
  AuthMethodDidNotMatch,
  PasskeyPrfNotSupported,
} from '@time-app-test/shared/error/errors.ts'
import { hexToUint8, uint8ToHex } from '@time-app-test/shared/helper/binary.ts'
import { isUndefined } from '@time-app-test/shared/guards.ts'
import { Crypt } from '@time-app-test/shared/helper/crypt.ts'

function addPrfExtensionToRegistration(
  options: authn.PublicKeyCredentialCreationOptionsJSON,
  salt: Uint8Array<ArrayBuffer>,
) {
  return {
    ...options,
    extensions: {
      ...options.extensions,
      prf: {
        eval: {
          first: salt,
        },
      },
    } as AuthenticationExtensionsClientInputs,
  }
}

function extractPrfFromRegistrationResponse(
  response: authn.RegistrationResponseJSON,
) {
  return {
    response: {
      ...response,
      clientExtensionResults: {
        appid: response.clientExtensionResults.appid,
        credProps: response.clientExtensionResults.credProps,
        hmacCreateSecret: response.clientExtensionResults.hmacCreateSecret,
        // remove the prf result
      },
    },
    prfResult: (
      response.clientExtensionResults as AuthenticationExtensionsClientOutputs
    )?.prf?.results?.first,
  }
}

function addPrfExtensionToCredRequest(
  options: authn.PublicKeyCredentialRequestOptionsJSON,
  salt: Uint8Array<ArrayBuffer>,
) {
  return {
    ...options,
    extensions: {
      ...options.extensions,
      prf: {
        eval: {
          first: salt,
        },
      },
    } as AuthenticationExtensionsClientInputs,
  }
}

function extractPrfFromAuthResponse(
  response: authn.AuthenticationResponseJSON,
) {
  return {
    response: {
      ...response,
      clientExtensionResults: {
        appid: response.clientExtensionResults.appid,
        credProps: response.clientExtensionResults.credProps,
        hmacCreateSecret: response.clientExtensionResults.hmacCreateSecret,
        // remove the prf result
      },
    },
    prfResult: (
      response.clientExtensionResults as AuthenticationExtensionsClientOutputs
    )?.prf?.results?.first,
  }
}

export class PasskeyStrategy extends AuthStrategy {
  private async startPasskeyRegistration(
    options: authn.PublicKeyCredentialCreationOptionsJSON,
    kekSalt: Uint8Array<ArrayBuffer>,
  ) {
    return extractPrfFromRegistrationResponse(
      await authn.startRegistration({
        optionsJSON: addPrfExtensionToRegistration(options, kekSalt),
      }),
    )
  }

  private async startPasskeyAuthentication(
    options: authn.PublicKeyCredentialRequestOptionsJSON,
    kekSalt: string,
  ) {
    return extractPrfFromAuthResponse(
      await authn.startAuthentication({
        optionsJSON: addPrfExtensionToCredRequest(options, hexToUint8(kekSalt)),
      }),
    )
  }

  async register({ username }: RegisterFormValues): Promise<void> {
    const { userId, auth } = await this.api.startRegistration({
      username,
      method: AuthMethod.Passkey,
    })

    if (auth.method !== AuthMethod.Passkey) {
      throw AuthMethodDidNotMatch({ expected: AuthMethod.Passkey })
    }

    const kekSalt = Crypt.generateSalt()

    const { response, prfResult: kekBuffer } =
      await this.startPasskeyRegistration(auth.options, kekSalt)

    if (isUndefined(kekBuffer)) {
      throw PasskeyPrfNotSupported()
    }

    const dek = await crypto.subtle.exportKey(
      'raw',
      await Crypt.generatePrivateKey(),
    )
    const kek = await crypto.subtle.importKey(
      'raw',
      kekBuffer,
      'AES-GCM',
      true,
      ['encrypt'],
    )
    const encryptedDek = await Crypt.encrypt(dek, kek)

    await this.api.finishRegistration({
      username,
      userId,
      auth: {
        response,
        method: AuthMethod.Passkey,
      },
      encryption: {
        kekSalt: uint8ToHex(kekSalt),
        encryptedDek: uint8ToHex(encryptedDek),
      },
    })
  }

  async login({ username }: LoginFormValues): Promise<LoginResult> {
    const {
      userId,
      auth,
      encryption: { kekSalt },
    } = await this.api.startLogin({
      username,
      auth: {
        method: AuthMethod.Passkey,
      },
    })

    if (auth.method !== AuthMethod.Passkey) {
      throw AuthMethodDidNotMatch({ expected: AuthMethod.Passkey })
    }

    const { response, prfResult: kekBuffer } =
      await this.startPasskeyAuthentication(auth.options, kekSalt)

    if (isUndefined(kekBuffer)) {
      throw PasskeyPrfNotSupported()
    }

    const {
      accessToken,
      encryption: { encryptedDek },
    } = await this.api.finishLogin({
      userId,
      auth: {
        method: AuthMethod.Passkey,
        response,
      },
    })

    const kek = await crypto.subtle.importKey(
      'raw',
      kekBuffer,
      'AES-GCM',
      true,
      ['decrypt'],
    )
    const dek = await this.decryptDek(encryptedDek, kek)

    return { accessToken, dek }
  }
}
