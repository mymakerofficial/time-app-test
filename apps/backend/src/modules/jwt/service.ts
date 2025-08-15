import { jwtVerify, SignJWT } from 'jose'
import { InvalidJwt } from '@time-app-test/shared/error/errors.ts'

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

  async jwtVerify(jwt: string) {
    const { payload } = await jwtVerify<{ sub: string }>(
      jwt,
      JwtService.jwtSecret,
      {
        algorithms: ['HS256'],
      },
    )

    if (!('sub' in payload)) {
      throw InvalidJwt()
    }

    return payload
  }
}
