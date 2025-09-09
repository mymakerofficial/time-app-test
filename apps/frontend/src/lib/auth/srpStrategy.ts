import { AuthStrategy, LoginResult } from '@/lib/auth/authStrategy.ts'
import * as srp from 'secure-remote-password/client'
import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import { AuthMethodDidNotMatch } from '@time-app-test/shared/error/errors.ts'
import { Crypt } from '@time-app-test/shared/helper/crypt.ts'
import { hexToUint8, uint8ToHex } from '@time-app-test/shared/helper/binary.ts'
import { LoginFormValues, RegisterFormValues } from '@/lib/schema/form.ts'

export class SrpStrategy extends AuthStrategy {
  async register({ username, password }: RegisterFormValues): Promise<void> {
    const { userId } = await this.api.startRegistration({
      username,
      method: AuthMethod.Srp,
    })

    const authSalt = srp.generateSalt()
    const authPrivateKey = srp.derivePrivateKey(authSalt, userId, password)
    const authVerifier = srp.deriveVerifier(authPrivateKey)

    const dek = await Crypt.generatePrivateKey()
    const kekSalt = Crypt.generateSalt()
    const kek = await Crypt.deriveKey(
      await Crypt.phraseToKey(password),
      kekSalt,
    )
    const exportedDek = await crypto.subtle.exportKey('raw', dek)
    const encryptedDek = await Crypt.encrypt(exportedDek, kek)

    await this.api.finishRegistration({
      username,
      userId,
      auth: {
        salt: authSalt,
        verifier: authVerifier,
        method: AuthMethod.Srp,
      },
      encryption: {
        kekSalt: uint8ToHex(kekSalt),
        encryptedDek: uint8ToHex(encryptedDek),
      },
    })
  }

  async login({ username, password }: LoginFormValues): Promise<LoginResult> {
    const clientEphemeral = srp.generateEphemeral()

    const {
      userId,
      auth: startAuth,
      encryption: { kekSalt },
    } = await this.api.startLogin({
      username,
      auth: {
        method: AuthMethod.Srp,
        clientPublicEphemeral: clientEphemeral.public,
      },
    })

    if (startAuth.method !== AuthMethod.Srp) {
      throw AuthMethodDidNotMatch({ expected: AuthMethod.Srp })
    }

    const privateKey = srp.derivePrivateKey(startAuth.salt, userId, password)
    const clientSession = srp.deriveSession(
      clientEphemeral.secret,
      startAuth.serverPublicEphemeral,
      startAuth.salt,
      userId,
      privateKey,
    )

    const {
      accessToken,
      auth: finishAuth,
      encryption: { encryptedDek },
    } = await this.api.finishLogin({
      userId,
      auth: {
        method: AuthMethod.Srp,
        clientProof: clientSession.proof,
      },
    })

    if (finishAuth.method !== AuthMethod.Srp) {
      throw AuthMethodDidNotMatch({ expected: AuthMethod.Srp })
    }

    srp.verifySession(
      clientEphemeral.public,
      clientSession,
      finishAuth.serverProof,
    )

    const kek = await Crypt.deriveKey(
      await Crypt.phraseToKey(password),
      hexToUint8(kekSalt),
    )
    const dek = await this.decryptDek(encryptedDek, kek)

    return { accessToken, dek }
  }
}
