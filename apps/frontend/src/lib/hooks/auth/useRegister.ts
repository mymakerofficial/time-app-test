import { useMutation } from '@tanstack/react-query'
import { RegisterFormValues } from '@/lib/schema/form.ts'
import { useLogin } from '@/lib/hooks/auth/useLogin.ts'
import { useAuth } from '@/lib/auth/auth.ts'

export function useRegister({
  onSuccess,
}: {
  onSuccess?: () => void | Promise<void>
}) {
  const auth = useAuth()
  const { mutateAsync: login } = useLogin({
    onSuccess,
  })

  return useMutation({
    mutationKey: ['auth', 'register'],
    mutationFn: async (values: RegisterFormValues) => {
      await auth.getStrategy(values.method).register(values)
    },
    onSuccess: async (_, values) => {
      await login(values)
    },
  })
}
