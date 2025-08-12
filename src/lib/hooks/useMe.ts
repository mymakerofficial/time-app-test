import { useQuery } from '@tanstack/react-query'
import { getAccessToken } from '@/lib/authStore.ts'

export function useMe() {
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
