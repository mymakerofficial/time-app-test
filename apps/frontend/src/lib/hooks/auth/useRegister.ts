import { useMutation } from '@tanstack/react-query'
import * as srp from 'secure-remote-password/client'
import { RegisterFormValues } from '@/lib/schema/form.ts'
import { useLogin } from '@/lib/hooks/auth/useLogin.ts'
import { getResponseBody } from '@time-app-test/shared/fetch/response.js'
import {
  RegisterFinishBody,
  RegisterFinishBodySchema,
  RegisterStartBody,
  RegisterStartBodySchema,
  RegisterStartResponseSchema,
} from '@time-app-test/shared/model/rest/auth.ts'
import { uint8ToHex } from '@time-app-test/shared/helper/binary.ts'
import { Crypt } from '@time-app-test/shared/helper/crypt.ts'
import * as authn from '@simplewebauthn/browser'
import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import {
  AuthMethodDidNotMatch,
  NotImplemented,
} from '@time-app-test/shared/error/errors.ts'

async function startRegistration(data: RegisterStartBody) {
  const response = await fetch('/api/auth/register/start', {
    method: 'POST',
    body: JSON.stringify(RegisterStartBodySchema.parse(data)),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return getResponseBody({
    response,
    schema: RegisterStartResponseSchema,
  })
}

async function finishRegistration(data: RegisterFinishBody) {
  const response = await fetch('/api/auth/register/finish', {
    method: 'POST',
    body: JSON.stringify(RegisterFinishBodySchema.parse(data)),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  await getResponseBody({
    response,
  })
}

async function registerSrp({ username, password }: RegisterFormValues) {
  const { userId } = await startRegistration({
    username,
    method: AuthMethod.Srp,
  })

  const authSalt = srp.generateSalt()
  const authPrivateKey = srp.derivePrivateKey(authSalt, userId, password)
  const authVerifier = srp.deriveVerifier(authPrivateKey)

  const dek = await Crypt.generatePrivateKey()
  const kekSalt = Crypt.generateSalt()
  const kek = await Crypt.deriveKey(await Crypt.phraseToKey(password), kekSalt)
  const exportedDek = await crypto.subtle.exportKey('raw', dek)
  const encryptedDek = await Crypt.encrypt(exportedDek, kek)

  await finishRegistration({
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

async function registerPasskey({ username }: RegisterFormValues) {
  const { userId, auth } = await startRegistration({
    username,
    method: AuthMethod.Passkey,
  })

  if (auth.method !== AuthMethod.Passkey) {
    throw AuthMethodDidNotMatch({ expected: AuthMethod.Passkey })
  }

  const response = await authn.startRegistration({
    optionsJSON: auth.options,
  })

  // TODO get prf

  throw NotImplemented()

  const dek = await Crypt.generatePrivateKey()
  const kekSalt = Crypt.generateSalt()
  const kek = await Crypt.deriveKey(
    await Crypt.phraseToKey('TODO CHANGE THIS'),
    kekSalt,
  )
  const exportedDek = await crypto.subtle.exportKey('raw', dek)
  const encryptedDek = await Crypt.encrypt(exportedDek, kek)

  await finishRegistration({
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

export function useRegisterSrp({
  onSuccess,
}: {
  onSuccess?: () => void | Promise<void>
}) {
  const { mutateAsync: login } = useLogin({
    onSuccess,
  })

  return useMutation({
    mutationKey: ['register', 'srp'],
    mutationFn: async (values: RegisterFormValues) => {
      switch (values.method) {
        case AuthMethod.Srp:
          return registerSrp(values)
        case AuthMethod.Passkey:
          return registerPasskey(values)
      }
    },
    onSuccess: async (_, values) => {
      await login(values)
    },
  })
}
