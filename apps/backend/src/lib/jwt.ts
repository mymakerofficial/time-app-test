import { SignJWT } from 'jose'

export function generateAccessToken({ userId }: { userId: string }) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(
      Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY_SECONDS,
    )
    .sign(JWT_SECRET)
}
