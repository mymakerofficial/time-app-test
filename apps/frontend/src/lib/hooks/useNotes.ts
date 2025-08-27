import { useAccessToken } from '@/lib/authStore.ts'
import { useQuery } from '@tanstack/react-query'

export function useNotes() {
  const getAccessToken = useAccessToken()

  return useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const response = await fetch('/api/notes', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
      }).then()
      return response.json()
    },
  })
}
