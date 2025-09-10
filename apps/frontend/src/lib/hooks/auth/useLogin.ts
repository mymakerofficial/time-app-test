import { useMutation } from '@tanstack/react-query'
import { LoginFormValues } from '@/lib/schema/form.ts'
import { useSetSession } from '@/lib/application/session/sessionStore.ts'
import { useContainer } from '@/lib/application/container.ts'

export function useLogin({
  onSuccess,
}: {
  onSuccess?: () => void | Promise<void>
}) {
  const { authService } = useContainer()
  const setSession = useSetSession()

  return useMutation({
    mutationKey: ['auth', 'login'],
    mutationFn: async (values: LoginFormValues) => {
      const { accessToken, dek, userId } = await authService
        .getStrategy(values.method)
        .login(values)
      setSession({ accessToken, encryptionKey: dek, userId })
    },
    onSuccess: async () => {
      return onSuccess?.()
    },
  })
}
