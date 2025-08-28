import { useAccessToken, useSetSession } from '@/lib/authStore.ts'
import { useMutation } from '@tanstack/react-query'

export function useLogout() {
  const setSession = useSetSession()
  const getAccessToken = useAccessToken()

  return useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      })
    },
    onSuccess: async () => {
      setSession({
        accessToken: null,
        encryptionKey: null,
      })
    },
  })
}
