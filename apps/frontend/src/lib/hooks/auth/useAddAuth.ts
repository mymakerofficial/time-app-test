import { useMutation } from '@tanstack/react-query'
import { AddAuthFormValues } from '@/lib/schema/form.ts'
import { useContainer } from '@/lib/application/container.ts'

export function useAddAuth({
  onSuccess,
}: {
  onSuccess?: () => void | Promise<void>
}) {
  const { authService } = useContainer()

  return useMutation({
    mutationKey: ['auth', 'add'],
    mutationFn: async (values: AddAuthFormValues) => {
      await authService.getStrategy(values.method).addAuthenticator(values)
    },
    onSuccess,
  })
}
