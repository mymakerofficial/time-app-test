import { useSetSession } from '@/lib/application/session/sessionStore.ts'
import { useMutation } from '@tanstack/react-query'
import { useContainer } from '@/lib/application/container.ts'

export function useLogout() {
  const setSession = useSetSession()
  const { authService } = useContainer()

  return useMutation({
    mutationKey: ['auth', 'logout'],
    mutationFn: async () => {
      await authService.logout().catch()

      setSession({
        accessToken: null,
        userId: null,
        encryptionKey: null,
      })
    },
  })
}
