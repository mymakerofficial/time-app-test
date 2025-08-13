import { useSetAccessToken } from '@/lib/authStore.ts'
import { useMutation } from '@tanstack/react-query'

export function useLogout() {
  const setAccessToken = useSetAccessToken()

  return useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      setAccessToken(null)
    },
  })
}
