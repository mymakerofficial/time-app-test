import z from 'zod'
import { JwtAccessTokenSchema } from '@/model/domain/auth.ts'
import { RegistrationStart } from '@/model/domain/auth/registrationStart.ts'
import { RegistrationFinish } from '@/model/domain/auth/registrationFinish.ts'
import { LoginStart } from '@/model/domain/auth/loginStart.ts'
import { LoginFinish } from '@/model/domain/auth/loginFinish.ts'
import { EncryptionPublicDtoSchema } from '@/model/domain/auth/encryption.ts'

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

export const LoginFinishBodySchema = LoginFinish.ConcreteInputDtoSchema
export type LoginFinishBody = z.Infer<typeof LoginFinishBodySchema>

export const LoginFinishResponseSchema = z.object({
  auth: LoginFinish.ClientResponseDtoSchema,
  encryption: EncryptionPublicDtoSchema,
  accessToken: JwtAccessTokenSchema,
})

export const GetTokenResponseSchema = z.object({
  accessToken: JwtAccessTokenSchema,
})
