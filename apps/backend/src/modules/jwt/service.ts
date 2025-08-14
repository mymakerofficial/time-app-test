import { BaseServiceContext, Service } from '@/lib/service.ts'
import { SignJWT } from 'jose'
import { Elysia } from 'elysia'

export class JwtService extends Service {
  private static readonly jwtSecret = new TextEncoder().encode(
    'super-secret-change-me',
  )
  private static readonly accessTokenExpirySeconds = 60 * 15 // 15 minutes

  constructor(context: BaseServiceContext) {
    super(context)
  }

  generateAccessToken({ userId }: { userId: string }) {
    return new SignJWT({ sub: userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(
        Math.floor(Date.now() / 1000) + JwtService.accessTokenExpirySeconds,
      )
      .sign(JwtService.jwtSecret)
  }
}

export const jwtService = new Elysia({
  name: 'jwtService',
}).derive({ as: 'global' }, (context) => ({
  jwtService: new JwtService(context),
}))
