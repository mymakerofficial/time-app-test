import { useQuery } from '@tanstack/react-query'
import { useSession } from '../application/session/sessionStore.ts'
import { getResponseBody } from '@time-app-test/shared/fetch/response.ts'
import { GetUsersMeResponse } from '@time-app-test/shared/model/rest/user.ts'

export function useMe() {
  const { getAccessToken, getUserIdSafe } = useSession()

  return useQuery({
    queryKey: ['user', getUserIdSafe(), 'me'],
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
