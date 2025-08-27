import { useMutation } from '@tanstack/react-query'
import { LoginFormValues } from '@/lib/schema/form.ts'
import * as srp from 'secure-remote-password/client'
import { getResponseBody } from '@time-app-test/shared/fetch/response.ts'
import { useSetAccessToken } from '@/lib/authStore.ts'
import {
  PasswordLoginFinishClientData,
  PasswordLoginFinishClientDataSchema,
  PasswordLoginFinishServerDataSchema,
  PasswordLoginStartClientData,
  PasswordLoginStartClientDataSchema,
  PasswordLoginStartServerDataSchema,
} from '@time-app-test/shared/domain/model/auth.ts'

async function startLogin(data: PasswordLoginStartClientData) {
  const response = await fetch('/api/auth/login/start', {
    method: 'POST',
    body: JSON.stringify(PasswordLoginStartClientDataSchema.parse(data)),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return getResponseBody({
    response,
    schema: PasswordLoginStartServerDataSchema,
  })
}

async function finishLogin(data: PasswordLoginFinishClientData) {
  const response = await fetch('/api/auth/login/finish', {
    method: 'POST',
    body: JSON.stringify(PasswordLoginFinishClientDataSchema.parse(data)),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return getResponseBody({
    response,
    schema: PasswordLoginFinishServerDataSchema,
  })
}

export function useLogin({
  onSuccess,
}: {
  onSuccess?: () => void | Promise<void>
}) {
  const setAccessToken = useSetAccessToken()

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async ({ username, password }: LoginFormValues) => {
      const clientEphemeral = srp.generateEphemeral()

      const { userId, salt, serverPublicEphemeral } = await startLogin({
        username,
        clientPublicEphemeral: clientEphemeral.public,
      })

      const privateKey = srp.derivePrivateKey(salt, userId, password)
      const clientSession = srp.deriveSession(
        clientEphemeral.secret,
        serverPublicEphemeral,
        salt,
        userId,
        privateKey,
      )

      const { serverProof, accessToken } = await finishLogin({
        userId,
        clientProof: clientSession.proof,
      })

      srp.verifySession(clientEphemeral.public, clientSession, serverProof)

      setAccessToken(accessToken)
    },
    onSuccess: async () => {
      return onSuccess?.()
    },
  })
}
