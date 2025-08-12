import { useMutation } from '@tanstack/react-query'
import { LoginFormValues } from '@/lib/schema/form.ts'
import * as SRP from 'secure-remote-password/client'
import {
  PostAuthLoginFinishRequest,
  PostAuthLoginFinishRequestSchema,
  PostAuthLoginFinishResponseSchema,
  PostAuthLoginStartRequest,
  PostAuthLoginStartRequestSchema,
  PostAuthLoginStartResponseSchema,
} from '@/lib/schema/auth.ts'
import { getResponseBody } from '@/lib/utils.ts'

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

export function useLogin() {
  return useMutation({
    mutationFn: async ({ username, password }: LoginFormValues) => {
      const clientEphemeral = SRP.generateEphemeral()

      const { userId, salt, serverPublicEphemeral } = await startLogin({
        username,
        clientPublicEphemeral: clientEphemeral.public,
      })

      const privateKey = SRP.derivePrivateKey(salt, userId, password)
      const clientSession = SRP.deriveSession(
        clientEphemeral.secret,
        serverPublicEphemeral,
        salt,
        userId,
        privateKey,
      )

      const { serverProof } = await finishLogin({
        userId,
        clientProof: clientSession.proof,
      })

      SRP.verifySession(clientEphemeral.public, clientSession, serverProof)

      console.log('Authenticated! Session key:', clientSession.key)
    },
  })
}
