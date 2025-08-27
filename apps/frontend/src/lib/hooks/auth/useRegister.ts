import { useMutation } from '@tanstack/react-query'
import * as srp from 'secure-remote-password/client'
import { RegisterFormValues } from '@/lib/schema/form.ts'
import { useLogin } from '@/lib/hooks/auth/useLogin.ts'
import { getResponseBody } from '@time-app-test/shared/fetch/response.js'
import z from 'zod'
import {
  UserPasswordData,
  UserPasswordDataSchema,
} from '@time-app-test/shared/domain/model/auth.ts'

async function startRegistration(data: { username: string }) {
  const response = await fetch('/api/auth/register/start', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return getResponseBody({
    response,
    schema: z.object({
      userId: z.nanoid(),
    }),
  })
}

async function finishRegistration(data: UserPasswordData) {
  const response = await fetch('/api/auth/register/finish', {
    method: 'POST',
    body: JSON.stringify(UserPasswordDataSchema.parse(data)),
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
