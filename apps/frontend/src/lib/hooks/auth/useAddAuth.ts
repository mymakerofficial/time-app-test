import { useMutation } from '@tanstack/react-query'
import { AddAuthFormValues } from '@/lib/schema/form.ts'
import { useAuth } from '@/lib/auth/auth.ts'

export function useAddAuth({
  onSuccess,
}: {
  onSuccess?: () => void | Promise<void>
}) {
  const auth = useAuth()

  return useMutation({
    mutationKey: ['auth', 'add'],
    mutationFn: async (values: AddAuthFormValues) => {
      await auth.getStrategy(values.method).addAuthenticator(values)
    },
    onSuccess,
  })
}
