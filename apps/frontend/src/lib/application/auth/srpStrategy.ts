import {
  AuthStrategy,
  LoginResult,
} from '@/lib/application/auth/authStrategy.ts'
import * as srp from 'secure-remote-password/client'
import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import { AuthMethodDidNotMatch } from '@time-app-test/shared/error/errors.ts'
import { Crypt } from '@time-app-test/shared/helper/crypt.ts'
import { hexToUint8, uint8ToHex } from '@time-app-test/shared/helper/binary.ts'
import {
  AddAuthFormValues,
  LoginFormValues,
  RegisterFormValues,
} from '@/lib/schema/form.ts'

export class SrpStrategy extends AuthStrategy {
  private generateAuth(userId: string, password: string) {
    const authSalt = srp.generateSalt()
    const authPrivateKey = srp.derivePrivateKey(authSalt, userId, password)
    const authVerifier = srp.deriveVerifier(authPrivateKey)

    return {
      salt: authSalt,
      verifier: authVerifier,
      method: AuthMethod.Srp,
    }
  }

  protected async generateEncryption(password: string) {
    const dek = await Crypt.generatePrivateKey()
    const kekSalt = Crypt.generateSalt()
    const kek = await Crypt.deriveKey(
      await Crypt.phraseToKey(password),
      kekSalt,
    )
    const exportedDek = await crypto.subtle.exportKey('raw', dek)
    const encryptedDek = await Crypt.encrypt(exportedDek, kek)

    return {
      kekSalt: uint8ToHex(kekSalt),
      encryptedDek: uint8ToHex(encryptedDek),
    }
  }

  async register({ username, password }: RegisterFormValues): Promise<void> {
    const { userId } = await this.authApi.startRegistration({
      username,
      method: AuthMethod.Srp,
    })

    const auth = this.generateAuth(userId, password)
    const encryption = await this.generateEncryption(password)

    await this.authApi.finishRegistration({
      username,
      userId,
      auth,
      encryption,
    })
  }

  async addAuthenticator({ password }: AddAuthFormValues) {
    await this.authApi.startAddAuth({
      method: AuthMethod.Srp,
    })

    const userId = this.session.getUserId()

    const auth = this.generateAuth(userId, password)
    const encryption = await this.generateEncryption(password)

    await this.authApi.finishAddAuth({
      auth,
      encryption,
    })
  }

  async login({ username, password }: LoginFormValues): Promise<LoginResult> {
    const clientEphemeral = srp.generateEphemeral()

    const {
      userId,
      auth: startAuth,
      encryption: { kekSalt },
    } = await this.authApi.startLogin({
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
    } = await this.authApi.finishLogin({
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

    return { accessToken, dek, userId }
  }
}
