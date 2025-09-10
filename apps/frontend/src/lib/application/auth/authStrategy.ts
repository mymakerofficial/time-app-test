import {
  AddAuthFormValues,
  LoginFormValues,
  RegisterFormValues,
  WithAuthMethod,
} from '@/lib/schema/form.ts'
import { Crypt } from '@time-app-test/shared/helper/crypt.ts'
import { hexToUint8 } from '@time-app-test/shared/helper/binary.ts'
import { AuthApi } from '@/lib/application/auth/api.ts'
import { SessionContext } from '@/lib/application/session/sessionStore.ts'
import { BaseService } from '@/lib/application/base/baseService.ts'

export interface LoginResult {
  accessToken: string
  dek: CryptoKey
  userId: string
}

export abstract class AuthStrategy extends BaseService {
  protected readonly authApi: AuthApi

  constructor(container: { authApi: AuthApi; session: SessionContext }) {
    super(container)
    this.authApi = container.authApi
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

  abstract register(values: WithAuthMethod<RegisterFormValues>): Promise<void>
  abstract addAuthenticator(
    values: WithAuthMethod<AddAuthFormValues>,
  ): Promise<void>
  abstract login(values: WithAuthMethod<LoginFormValues>): Promise<LoginResult>
}
