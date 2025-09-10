import { useMutation } from '@tanstack/react-query'
import { LoginFormValues } from '@/lib/schema/form.ts'
import { useSetSession } from '@/lib/application/session/sessionStore.ts'
import { useAuth } from '@/lib/application/auth/auth.ts'

export function useLogin({
  onSuccess,
}: {
  onSuccess?: () => void | Promise<void>
}) {
  const auth = useAuth()
  const setSession = useSetSession()

  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: async (values: LoginFormValues) => {
      const { accessToken, dek, userId } = await auth
        .getStrategy(values.method)
        .login(values)
      setSession({ accessToken, encryptionKey: dek, userId })
    },
    onSuccess: async () => {
      return onSuccess?.()
    },
  })
}
