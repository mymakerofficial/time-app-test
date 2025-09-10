import { useMutation } from '@tanstack/react-query'
import { NotImplemented } from '@time-app-test/shared/error/errors.ts'
import { useHandleMutationAuthError } from '@/lib/hooks/helpers/authQuery.ts'

export function useGetToken() {
  // const auth = useAuth()
  // const setSession = useSetSession()
  const handleAuthError = useHandleMutationAuthError()

  return useMutation({
    mutationKey: ['auth', 'get-token'],
    retry: () => false,
    mutationFn: async () => {
      throw NotImplemented()
      // const { accessToken } = await auth.getToken()
      // setSession({ accessToken })
    },
    onError: handleAuthError(),
  })
}
