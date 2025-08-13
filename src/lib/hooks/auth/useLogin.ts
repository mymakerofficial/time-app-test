import { useMutation } from '@tanstack/react-query'
import { LoginFormValues } from '@/lib/schema/form.ts'
import * as srp from 'secure-remote-password/client'
import {
  PostAuthLoginFinishRequest,
  PostAuthLoginFinishRequestSchema,
  PostAuthLoginFinishResponseSchema,
  PostAuthLoginStartRequest,
  PostAuthLoginStartRequestSchema,
  PostAuthLoginStartResponseSchema,
} from '@/lib/schema/auth.ts'
import { getResponseBody } from '@/lib/utils.ts'
import { useSetAccessToken } from '@/lib/authStore.ts'

async function startLogin(data: PostAuthLoginStartRequest) {
  const response = await fetch('/api/auth/login/start', {
    method: 'POST',
    body: JSON.stringify(PostAuthLoginStartRequestSchema.parse(data)),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return getResponseBody({
    response,
    schema: PostAuthLoginStartResponseSchema,
  })
}

async function finishLogin(data: PostAuthLoginFinishRequest) {
  const response = await fetch('/api/auth/login/finish', {
    method: 'POST',
    body: JSON.stringify(PostAuthLoginFinishRequestSchema.parse(data)),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return getResponseBody({
    response,
    schema: PostAuthLoginFinishResponseSchema,
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
