import { AuthApi } from '@/lib/auth/api.ts'
import { LoginFormValues, RegisterFormValues } from '@/lib/schema/form.ts'
import { Crypt } from '@time-app-test/shared/helper/crypt.ts'
import { hexToUint8 } from '@time-app-test/shared/helper/binary.ts'

export interface LoginResult {
  accessToken: string
  dek: CryptoKey
}

export abstract class AuthStrategy {
  protected api: AuthApi

  constructor(api: AuthApi) {
    this.api = api
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
  abstract login(values: LoginFormValues): Promise<LoginResult>
}
