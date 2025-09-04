import z from 'zod'
import { UserIdSchema } from '@/model/domain/user.ts'
import {
  EncryptedDekSchema,
  JwtAccessTokenSchema,
  KekSaltSchema,
  SrpClientProofSchema,
  SrpServerProofSchema,
} from '@/model/domain/auth.ts'
import { RegistrationStart } from '@/model/domain/auth/registrationStart.ts'
import { RegistrationFinish } from '@/model/domain/auth/registrationFinish.ts'
import { LoginStart } from '@/model/domain/auth/loginStart.ts'

export const RegisterStartBodySchema = RegistrationStart.ConcreteInputDtoSchema
export type RegisterStartBody = z.Infer<typeof RegisterStartBodySchema>

export const RegisterStartResponseSchema =
  RegistrationStart.ConcreteResultDtoSchema

export const RegisterFinishBodySchema =
  RegistrationFinish.ConcreteInputDtoSchema
export type RegisterFinishBody = z.Infer<typeof RegisterFinishBodySchema>

export const LoginStartBodySchema = LoginStart.ConcreteInputDtoSchema
export type LoginStartBody = z.Infer<typeof LoginStartBodySchema>

export const LoginStartResponseSchema = LoginStart.ConcreteResultDtoSchema

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
