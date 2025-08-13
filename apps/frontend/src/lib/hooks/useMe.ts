import { useQuery } from '@tanstack/react-query'
import { useAccessToken } from '../authStore.ts'

export function useMe() {
  const getAccessToken = useAccessToken()

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await fetch('/api/me', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
      })
      return response.json()
    },
  })
}
