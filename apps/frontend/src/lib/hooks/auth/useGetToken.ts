import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useLogout } from './useLogout.ts'
import { ApiError } from '@time-app-test/shared/error/apiError.ts'
import { NotImplemented } from '@time-app-test/shared/error/errors.ts'

export function useGetToken() {
  const navigate = useNavigate()
  // const auth = useAuth()
  // const setSession = useSetSession()
  const { mutateAsync: logout } = useLogout()

  return useMutation({
    mutationKey: ['auth', 'get-token'],
    retry: () => false,
    mutationFn: async () => {
      throw NotImplemented()
      // const { accessToken } = await auth.getToken()
      // setSession({ accessToken })
    },
    onError: async (error) => {
      if (error instanceof ApiError && error.statusCode === 401) {
        await logout()
        await navigate({ to: '/auth/login' })
      }
    },
  })
}
