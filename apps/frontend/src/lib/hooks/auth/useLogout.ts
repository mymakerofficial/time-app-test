import { useAccessToken, useSetAccessToken } from '../../authStore.ts'
import { useMutation } from '@tanstack/react-query'

export function useLogout() {
  const setAccessToken = useSetAccessToken()
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
      setAccessToken(null)
    },
  })
}
