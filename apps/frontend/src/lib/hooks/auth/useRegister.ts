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
import { ab2str, uint8ToHex } from '@time-app-test/shared/helper/binary.ts'
import { Crypt } from '@/lib/utils/crypt.ts'

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

export function useRegister({
  onSuccess,
}: {
  onSuccess?: () => void | Promise<void>
}) {
  const { mutateAsync: login } = useLogin({
    onSuccess,
  })

  return useMutation({
    mutationKey: ['register'],
    mutationFn: async ({ username, password }: RegisterFormValues) => {
      const { userId } = await startRegistration({ username })

      const authSalt = srp.generateSalt()
      const authPrivateKey = srp.derivePrivateKey(authSalt, userId, password)
      const authVerifier = srp.deriveVerifier(authPrivateKey)

      const dek = await Crypt.generatePrivateKey()
      const kekSalt = Crypt.generateSalt()
      const kek = await Crypt.deriveKey(
        await Crypt.passwordToKey(password),
        kekSalt,
      )
      const exportedDek = await crypto.subtle.exportKey('raw', dek)
      const encryptedDek = await Crypt.encrypt(exportedDek, kek)

      await finishRegistration({
        username,
        userId,
        authSalt,
        authVerifier,
        kekSalt: uint8ToHex(kekSalt),
        encryptedDek: uint8ToHex(encryptedDek),
      })
    },
    onSuccess: async (_, { username, password }) => {
      await login({ username, password })
    },
  })
}
