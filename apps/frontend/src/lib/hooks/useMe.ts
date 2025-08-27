import { useQuery } from '@tanstack/react-query'
import { useAccessToken } from '../authStore.ts'
import { getResponseBody } from '@time-app-test/shared/fetch/response.ts'
import { GetUsersMeResponse } from '@time-app-test/shared/model/rest/user.ts'

export function useMe() {
  const getAccessToken = useAccessToken()

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await fetch('/api/users/me', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
      })
      return getResponseBody({
        response,
        schema: GetUsersMeResponse,
      })
    },
  })
}
