import { useMutation } from '@tanstack/react-query'
import { useSetAccessToken } from '@/lib/authStore.ts'
import { useNavigate } from '@tanstack/react-router'
import { useLogout } from './useLogout.ts'
import { getResponseBody } from '@time-app-test/shared/fetch/response.ts'
import { z } from 'zod'
import { ApiError } from '@time-app-test/shared/error/apiError.ts'

export function useGetToken() {
  const navigate = useNavigate()
  const setAccessToken = useSetAccessToken()
  const { mutateAsync: logout } = useLogout()

  return useMutation({
    mutationKey: ['get-token'],
    retry: () => false,
    mutationFn: async () => {
      const response = await fetch('/api/auth/get-token', {
        method: 'POST',
      })
      const { accessToken } = await getResponseBody({
        response,
        schema: z.object({
          accessToken: z.string(),
        }),
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
