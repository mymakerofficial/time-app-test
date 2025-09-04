import z from 'zod'
import { CookieSchema } from '@/model/domain/cookie.ts'
import { UserIdSchema, UsernameSchema } from '@/model/domain/user.ts'
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

/** @deprecated */
export const UserPasswordDataSchema = z.object({
  userId: UserIdSchema,
  username: UsernameSchema,
  authSalt: SrpSaltSchema,
  authVerifier: SrpVerifierSchema,
  kekSalt: KekSaltSchema,
  encryptedDek: EncryptedDekSchema,
})
/** @deprecated */
export type UserPasswordData = z.Infer<typeof UserPasswordDataSchema>

/** @deprecated */
export const CreateUserPasswordDataSchema = z.object({
  userId: UserIdSchema,
  authSalt: SrpSaltSchema,
  authVerifier: SrpVerifierSchema,
  kekSalt: KekSaltSchema,
  encryptedDek: EncryptedDekSchema,
})
/** @deprecated */
export type CreateUserPasswordData = z.Infer<
  typeof CreateUserPasswordDataSchema
>

export const PasswordLoginStartClientDataSchema = z.object({
  username: UsernameSchema,
  clientPublicEphemeral: SrpClientPublicEphemeralSchema,
})
export type PasswordLoginStartClientData = z.Infer<
  typeof PasswordLoginStartClientDataSchema
>

export const PasswordLoginStartServerDataSchema = z.object({
  userId: UserIdSchema,
  authSalt: SrpSaltSchema,
  serverPublicEphemeral: SrpServerPublicEphemeralSchema,
})
export type PasswordLoginStartServerData = z.Infer<
  typeof PasswordLoginStartServerDataSchema
>

export const PasswordLoginFinishClientDataSchema = z.object({
  userId: UserIdSchema,
  clientProof: SrpClientProofSchema,
})
export type PasswordLoginFinishClientData = z.Infer<
  typeof PasswordLoginFinishClientDataSchema
>

export const PasswordLoginFinishServerDataSchema = z.object({
  serverProof: SrpServerProofSchema,
  accessToken: JwtAccessTokenSchema,
  refreshToken: CookieSchema,
  kekSalt: KekSaltSchema,
  encryptedDek: EncryptedDekSchema,
})
export type PasswordLoginFinishServerData = z.Infer<
  typeof PasswordLoginFinishServerDataSchema
>
