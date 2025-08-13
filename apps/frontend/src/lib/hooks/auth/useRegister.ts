import { useMutation } from '@tanstack/react-query'
import * as srp from 'secure-remote-password/client'
import {
  PostAuthRegisterFinishRequest,
  PostAuthRegisterFinishRequestSchema,
  PostAuthRegisterStartRequest,
  PostAuthRegisterStartRequestSchema,
  PostAuthRegisterStartResponseSchema,
} from '../../schema/auth.ts'
import { RegisterFormValues } from '../../schema/form.ts'
import { getResponseBody } from '../../utils.ts'
import { useLogin } from './useLogin.ts'

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

      const salt = srp.generateSalt()
      const privateKey = srp.derivePrivateKey(salt, userId, password)
      const verifier = srp.deriveVerifier(privateKey)

      await finishRegistration({
        username,
        userId,
        salt,
        verifier,
      })
    },
    onSuccess: async (_, { username, password }) => {
      await login({ username, password })
    },
  })
}
