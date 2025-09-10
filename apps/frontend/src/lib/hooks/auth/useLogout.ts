import {
  useSession,
  useSetSession,
} from '@/lib/application/session/sessionStore.ts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/application/auth/auth.ts'

export function useLogout() {
  const setSession = useSetSession()
  const auth = useAuth()

  return useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: async () => {
      await auth.logout().catch()

      setSession({
        accessToken: null,
        userId: null,
        encryptionKey: null,
      })
    },
  })
}
