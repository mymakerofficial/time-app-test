import { useMutation } from '@tanstack/react-query'
import { AuthRefreshResponseSchema } from '@/lib/schema/auth.ts'
import { getResponseBody } from '@/lib/utils.ts'
import { useSetAccessToken } from '@/lib/authStore.ts'
import { ApiError } from '@/lib/backend/error.ts'
import { useNavigate } from '@tanstack/react-router'
import { useLogout } from '@/lib/hooks/auth/useLogout.ts'

export function useRefresh() {
  const navigate = useNavigate()
  const setAccessToken = useSetAccessToken()
  const { mutateAsync: logout } = useLogout()

  return useMutation({
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
