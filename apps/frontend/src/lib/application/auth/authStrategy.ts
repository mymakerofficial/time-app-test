import { AuthApi } from '@/lib/application/auth/api.ts'
import {
  AddAuthFormValues,
  LoginFormValues,
  RegisterFormValues,
} from '@/lib/schema/form.ts'
import { Crypt } from '@time-app-test/shared/helper/crypt.ts'
import { hexToUint8 } from '@time-app-test/shared/helper/binary.ts'
import { SessionContext } from '@/lib/application/session/sessionStore.ts'

export interface LoginResult {
  accessToken: string
  dek: CryptoKey
  userId: string
}

export abstract class AuthStrategy {
  protected api: AuthApi
  protected session: SessionContext

  constructor(api: AuthApi, session: SessionContext) {
    this.api = api
    this.session = session
  }

  protected async decryptDek(
    encryptedDek: string,
    kek: CryptoKey,
  ): Promise<CryptoKey> {
    const decryptedDek = await Crypt.decrypt(hexToUint8(encryptedDek), kek)
    return await crypto.subtle.importKey('raw', decryptedDek, 'AES-GCM', true, [
      'decrypt',
      'encrypt',
    ])
  }

  abstract register(values: RegisterFormValues): Promise<void>
  abstract addAuthenticator(values: AddAuthFormValues): Promise<void>
  abstract login(values: LoginFormValues): Promise<LoginResult>
}
