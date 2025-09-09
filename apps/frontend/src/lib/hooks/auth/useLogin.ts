import { useMutation } from '@tanstack/react-query'
import { LoginFormValues } from '@/lib/schema/form.ts'
import { useSetSession } from '@/lib/authStore.ts'
import { useAuth } from '@/lib/auth/auth.ts'

export function useLogin({
  onSuccess,
}: {
  onSuccess?: () => void | Promise<void>
}) {
  const auth = useAuth()
  const setSession = useSetSession()

  return useMutation({
    mutationKey: ['login'],
    mutationFn: async (values: LoginFormValues) => {
      const { accessToken, dek } = await auth
        .getStrategy(values.method)
        .login(values)
      setSession({ accessToken, encryptionKey: dek })
    },
    onSuccess: async () => {
      return onSuccess?.()
    },
  })
}
