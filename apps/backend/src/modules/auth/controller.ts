import { Elysia } from 'elysia'
import { authService } from '@/modules/auth/service.ts'

export const authController = new Elysia({ prefix: '/auth' })
  .use(authService)
  .post('/login', async ({ authService }) => {
    await authService.signIn()
  })
