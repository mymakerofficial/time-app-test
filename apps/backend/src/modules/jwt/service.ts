import { SignJWT } from 'jose'

export class JwtService {
  private static readonly jwtSecret = new TextEncoder().encode(
    'super-secret-change-me',
  )
  private static readonly accessTokenExpirySeconds = 60 * 15 // 15 minutes

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
