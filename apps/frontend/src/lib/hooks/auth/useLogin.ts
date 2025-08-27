import { useMutation } from '@tanstack/react-query'
import { LoginFormValues } from '@/lib/schema/form.ts'
import * as srp from 'secure-remote-password/client'
import { getResponseBody } from '@time-app-test/shared/fetch/response.ts'
import { useSetAccessToken } from '@/lib/authStore.ts'
import {
  LoginFinishBody,
  LoginFinishBodySchema,
  LoginFinishResponseSchema,
  LoginStartBody,
  LoginStartBodySchema,
  LoginStartResponseSchema,
} from '@time-app-test/shared/model/rest/auth.ts'

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
