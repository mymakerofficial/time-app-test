import z from 'zod'
import { hexExamples } from '@/zod.ts'

export const AuthMethod = {
  Srp: 'SRP',
  Passkey: 'PASSKEY',
} as const
export type AuthMethod = (typeof AuthMethod)[keyof typeof AuthMethod]

export const AuthMethodSchema = z.enum(AuthMethod)
export const SrpSaltSchema = z.hex().meta({ examples: hexExamples() })
export const SrpVerifierSchema = z.hex().meta({ examples: hexExamples() })
export const SrpClientPublicEphemeralSchema = z
  .hex()
  .meta({ examples: hexExamples() })
export const SrpServerPublicEphemeralSchema = z
  .hex()
  .meta({ examples: hexExamples() })
export const SrpClientProofSchema = z.hex().meta({ examples: hexExamples() })
export const SrpServerProofSchema = z.hex().meta({ examples: hexExamples() })
export const JwtAccessTokenSchema = z.jwt()
export const KekSaltSchema = z.hex().meta({ examples: hexExamples() })
export const EncryptedDekSchema = z
  .hex()
  .describe('the data encryption key encrypted using the key encryption key')
  .meta({ examples: hexExamples() })

export const SRP_API_META = {
  title: 'Secure Remote Password',
}
export const PASSKEY_API_META = {
  title: 'Passkey',
}
