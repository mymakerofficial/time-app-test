import { Elysia } from 'elysia'
import { db } from '@/index.ts'
import { BaseServiceContext, Service } from '@/lib/service.ts'

export class AuthService extends Service {
  constructor(context: BaseServiceContext) {
    super(context)
  }

  async signIn() {
    await db.query.users.findFirst()
  }
}

export const authService = new Elysia({
  name: 'authService',
}).derive({ as: 'global' }, (context) => ({
  authService: new AuthService(context),
}))
