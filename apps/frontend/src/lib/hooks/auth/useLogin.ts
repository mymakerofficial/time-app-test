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
import { Crypt } from '@time-app-test/shared/helper/crypt.ts'
import { hexToUint8 } from '@time-app-test/shared/helper/binary.ts'
import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import { AuthMethodDidNotMatch } from '@time-app-test/shared/error/errors.ts'

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

      const { userId, auth: startAuth } = await startLogin({
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
        encryption,
      } = await finishLogin({
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
        hexToUint8(encryption.kekSalt),
      )
      const decryptedDek = await Crypt.decrypt(
        hexToUint8(encryption.encryptedDek),
        kek,
      )
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
