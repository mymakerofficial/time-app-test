import { useSetSession } from '@/lib/authStore.ts'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth/auth.ts'

export function useLogout() {
  const setSession = useSetSession()
  const auth = useAuth()

  return useMutation({
    mutationKey: ['logout'],
    mutationFn: async () => {
      await auth.logout()
    },
    onSuccess: async () => {
      setSession({
        accessToken: null,
        encryptionKey: null,
      })
    },
  })
}
