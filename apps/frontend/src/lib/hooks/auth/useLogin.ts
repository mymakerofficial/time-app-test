import { useMutation } from '@tanstack/react-query'
import { LoginFormValues } from '@/lib/schema/form.ts'
import * as srp from 'secure-remote-password/client'
import { getResponseBody } from '@time-app-test/shared/fetch/response.ts'
import { useSetSession } from '@/lib/authStore.ts'
import {
  LoginFinishBody,
  LoginFinishBodySchema,
  LoginFinishResponseSchema,
  LoginStartBody,
  LoginStartBodySchema,
  LoginStartResponseSchema,
} from '@time-app-test/shared/model/rest/auth.ts'
import { Crypt } from '@/lib/utils/crypt.ts'
import { hexToUint8 } from '@time-app-test/shared/helper/binary.ts'

async function startLogin(data: LoginStartBody) {
  const response = await fetch('/api/auth/login/start', {
    method: 'POST',
    body: JSON.stringify(LoginStartBodySchema.parse(data)),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return getResponseBody({
    response,
    schema: LoginStartResponseSchema,
  })
}

async function finishLogin(data: LoginFinishBody) {
  const response = await fetch('/api/auth/login/finish', {
    method: 'POST',
    body: JSON.stringify(LoginFinishBodySchema.parse(data)),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return getResponseBody({
    response,
    schema: LoginFinishResponseSchema,
  })
}

export function useLogin({
  onSuccess,
}: {
  onSuccess?: () => void | Promise<void>
}) {
  const setSession = useSetSession()

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async ({ username, password }: LoginFormValues) => {
      const clientEphemeral = srp.generateEphemeral()

      const { userId, authSalt, serverPublicEphemeral } = await startLogin({
        username,
        clientPublicEphemeral: clientEphemeral.public,
      })

      const privateKey = srp.derivePrivateKey(authSalt, userId, password)
      const clientSession = srp.deriveSession(
        clientEphemeral.secret,
        serverPublicEphemeral,
        authSalt,
        userId,
        privateKey,
      )

      const { serverProof, accessToken, kekSalt, encryptedDek } =
        await finishLogin({
          userId,
          clientProof: clientSession.proof,
        })

      srp.verifySession(clientEphemeral.public, clientSession, serverProof)

      const kek = await Crypt.deriveKey(
        await Crypt.passwordToKey(password),
        hexToUint8(kekSalt),
      )
      const decryptedDek = await Crypt.decrypt(hexToUint8(encryptedDek), kek)
      const dek = await crypto.subtle.importKey(
        'raw',
        decryptedDek,
        {
          name: 'AES-GCM',
        },
        true,
        ['decrypt', 'encrypt'],
      )

      setSession({ accessToken, encryptionKey: dek })
    },
    onSuccess: async () => {
      return onSuccess?.()
    },
  })
}
