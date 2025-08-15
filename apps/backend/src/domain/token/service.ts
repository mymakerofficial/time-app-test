import { jwtVerify, SignJWT } from 'jose'
import { InvalidAccessToken } from '@time-app-test/shared/error/errors.ts'
import crypto from 'node:crypto'
import { str2Uint8Array } from '@time-app-test/shared/helper/binary.ts'
import z from 'zod'

const CustomJwtPayloadSchema = z.object({
  sub: z.string(),
  device_id: z.string(),
})
export type CustomJwtPayload = z.infer<typeof CustomJwtPayloadSchema>

export class TokenService {
  private static readonly jwtSecret = new TextEncoder().encode(
    'super-secret-change-me',
  )
  private static readonly deviceIdSalt = new TextEncoder().encode('salty')
  private static readonly accessTokenExpirySeconds = 60 * 15 // 15 minutes

  async deriveDeviceId(key: string) {
    return new Promise<string>((resolve, reject) => {
      crypto.hkdf(
        'sha512',
        str2Uint8Array(key),
        TokenService.deviceIdSalt,
        'info',
        32,
        (err, derivedKey) => {
          if (err) {
            return reject(err)
          }
          resolve(Buffer.from(derivedKey).toString('hex'))
        },
      )
    })
  }

  generateRefreshToken() {
    return crypto.randomBytes(32).toString('hex')
  }

  generateAccessToken({
    userId,
    deviceId,
  }: {
    userId: string
    deviceId: string
  }) {
    return new SignJWT({ sub: userId, device_id: deviceId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(
        Math.floor(Date.now() / 1000) + TokenService.accessTokenExpirySeconds,
      )
      .sign(TokenService.jwtSecret)
  }

  async getJwtPayload(jwt: string) {
    const { payload } = await jwtVerify<CustomJwtPayload>(
      jwt,
      TokenService.jwtSecret,
      {
        algorithms: ['HS256'],
      },
    ).catch(() => {
      throw InvalidAccessToken()
    })

    const parsed = CustomJwtPayloadSchema.safeParse(payload)
    if (!parsed.success) {
      throw InvalidAccessToken()
    }

    return payload
  }

  async validateSession({
    accessToken,
    refreshToken,
  }: {
    accessToken: string
    refreshToken: string
  }) {
    const jwtPayload = await this.getJwtPayload(accessToken)
    const deviceId = await this.deriveDeviceId(refreshToken)

    if (jwtPayload.device_id !== deviceId) {
      throw InvalidAccessToken()
    }

    return { jwtPayload, deviceId }
  }
}
