import { Elysia } from 'elysia'
import { authController } from '@/modules/auth/controller.ts'

export const apiController = new Elysia({ prefix: '/api' }).use(authController)
