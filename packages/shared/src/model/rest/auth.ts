import z from 'zod'
import { UserIdSchema, UsernameSchema } from '@/model/domain/user.ts'
import {
  EncryptedDekSchema,
  JwtAccessTokenSchema,
  KekSaltSchema,
  PasswordLoginStartServerDataSchema,
  SrpClientProofSchema,
  SrpClientPublicEphemeralSchema,
  SrpServerProofSchema,
  UserPasswordDataSchema,
} from '@/model/domain/auth.ts'

export const RegisterStartBodySchema = z.object({
  username: UsernameSchema,
})
export type RegisterStartBody = z.Infer<typeof RegisterStartBodySchema>

export const RegisterStartResponseSchema = z.object({
  userId: UserIdSchema,
})

export const RegisterFinishBodySchema = UserPasswordDataSchema
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
