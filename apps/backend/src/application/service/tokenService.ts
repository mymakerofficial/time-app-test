import { jwtVerify, SignJWT } from 'jose'
import { InvalidAccessToken } from '@time-app-test/shared/error/errors.ts'
import { binaryStringToUint8 } from '@time-app-test/shared/helper/binary.ts'
import z from 'zod'
import * as crypto from 'node:crypto'

const CustomJwtPayloadSchema = z.object({
  sub: z.string(),
  device_id: z.string(),
})
export type CustomJwtPayload = z.infer<typeof CustomJwtPayloadSchema>

const JWT_SECRET = new TextEncoder().encode('super-secret-change-me')
const DEVICE_ID_SALT = new TextEncoder().encode('salty')
const ACCESS_TOKEN_EXPIRY_SEC = 60 * 15 // 15 minutes

export class TokenService {
  async deriveDeviceId(key: string) {
    // TODO migrate to WebCrypto API
    return new Promise<string>((resolve, reject) => {
      crypto.hkdf(
        'sha512',
        binaryStringToUint8(key),
        DEVICE_ID_SALT,
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
    // TODO migrate to WebCrypto API
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
        Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY_SEC,
      )
      .sign(JWT_SECRET)
  }

  async getJwtPayload(jwt: string) {
    const { payload } = await jwtVerify<CustomJwtPayload>(jwt, JWT_SECRET, {
      algorithms: ['HS256'],
    }).catch(() => {
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
