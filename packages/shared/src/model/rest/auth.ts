import z from 'zod'
import { UserIdSchema, UsernameSchema } from '@/model/domain/user.ts'
import {
  AuthMethodSchema,
  EncryptedDekSchema,
  JwtAccessTokenSchema,
  KekSaltSchema,
  PasswordLoginStartServerDataSchema,
  RegistrationStartClientRequestDtoSchema,
  SrpClientProofSchema,
  SrpClientPublicEphemeralSchema,
  SrpServerProofSchema,
} from '@/model/domain/auth.ts'
import { EncryptionPublicDtoSchema } from '@/model/domain/auth/encryption.ts'
import { RegistrationStartClientResponseDtoSchema } from '@/model/domain/auth/registrationStart.ts'

export const RegisterStartBodySchema = z.object({
  username: UsernameSchema,
  method: AuthMethodSchema,
})
export type RegisterStartBody = z.Infer<typeof RegisterStartBodySchema>

export const RegisterStartResponseSchema = z.object({
  userId: UserIdSchema,
  auth: RegistrationStartClientResponseDtoSchema,
})

export const RegisterFinishBodySchema = z.object({
  userId: UserIdSchema,
  username: UsernameSchema,
  auth: RegistrationStartClientRequestDtoSchema,
  encryption: EncryptionPublicDtoSchema,
})
export type RegisterFinishBody = z.Infer<typeof RegisterFinishBodySchema>

export const LoginStartBodySchema = z.object({
  username: UsernameSchema,
  clientPublicEphemeral: SrpClientPublicEphemeralSchema,
})
export type LoginStartBody = z.Infer<typeof LoginStartBodySchema>

export const LoginStartResponseSchema = PasswordLoginStartServerDataSchema

export const LoginFinishBodySchema = z.object({
  userId: UserIdSchema,
  clientProof: SrpClientProofSchema,
})
export type LoginFinishBody = z.Infer<typeof LoginFinishBodySchema>

export const LoginFinishResponseSchema = z.object({
  serverProof: SrpServerProofSchema,
  accessToken: JwtAccessTokenSchema,
  kekSalt: KekSaltSchema,
  encryptedDek: EncryptedDekSchema,
})

export const GetTokenResponseSchema = z.object({
  accessToken: JwtAccessTokenSchema,
})
