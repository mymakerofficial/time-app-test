import { useMutation } from '@tanstack/react-query'
import * as SRP from 'secure-remote-password/client'
import {
  PostAuthRegisterFinishRequest,
  PostAuthRegisterFinishRequestSchema,
  PostAuthRegisterStartRequest,
  PostAuthRegisterStartRequestSchema,
  PostAuthRegisterStartResponseSchema,
} from '@/lib/schema/auth.ts'
import { RegisterFormValues } from '@/lib/schema/form.ts'
import { getResponseBody } from '@/lib/utils.ts'

async function startRegistration(data: PostAuthRegisterStartRequest) {
  const response = await fetch('/api/auth/register/start', {
    method: 'POST',
    body: JSON.stringify(PostAuthRegisterStartRequestSchema.parse(data)),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return getResponseBody({
    response,
    schema: PostAuthRegisterStartResponseSchema,
  })
}

async function finishRegistration(data: PostAuthRegisterFinishRequest) {
  const response = await fetch('/api/auth/register/finish', {
    method: 'POST',
    body: JSON.stringify(PostAuthRegisterFinishRequestSchema.parse(data)),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error('Registration failed')
  }
}

export function useRegister() {
  return useMutation({
    mutationFn: async ({ username, password }: RegisterFormValues) => {
      const { userId } = await startRegistration({ username })

      const salt = 'bean' // crypto.randomBytes(16).toString('hex')
      const privateKey = SRP.derivePrivateKey(salt, userId, password)
      const verifier = SRP.deriveVerifier(privateKey)

      await finishRegistration({
        username,
        userId,
        salt,
        verifier,
      })
    },
  })
}
