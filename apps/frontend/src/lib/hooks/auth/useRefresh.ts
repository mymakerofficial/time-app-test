import { useMutation } from '@tanstack/react-query'
import { AuthRefreshResponseSchema } from '../../schema/auth.ts'
import { getResponseBody } from '../../utils.ts'
import { useSetAccessToken } from '../../authStore.ts'
import { ApiError } from '../../error.ts'
import { useNavigate } from '@tanstack/react-router'
import { useLogout } from './useLogout.ts'

export function useRefresh() {
  const navigate = useNavigate()
  const setAccessToken = useSetAccessToken()
  const { mutateAsync: logout } = useLogout()

  return useMutation({
    mutationKey: ['refresh'],
    retry: () => false,
    mutationFn: async () => {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
      })

      const { accessToken } = await getResponseBody({
        response,
        schema: AuthRefreshResponseSchema,
      })

      setAccessToken(accessToken)
    },
    onError: async (error) => {
      if (error instanceof ApiError && error.statusCode === 401) {
        await logout()
        await navigate({ to: '/auth/login' })
      }
    },
  })
}
