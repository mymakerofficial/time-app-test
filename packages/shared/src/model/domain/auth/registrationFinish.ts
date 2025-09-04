import z from 'zod'
import { RegistrationResponseJSONSchema } from '@/model/domain/auth/passkey.ts'
import {
  SrpUserAuthenticatorDtoSchema,
  UserAuthenticatorDtoSchema,
} from '@/model/domain/auth/authenticator.ts'
import { RegistrationCacheDtoSchema } from '@/model/domain/auth/registrationCache.ts'
import {
  AuthMethod,
  PASSKEY_API_META,
  SRP_API_META,
} from '@/model/domain/auth.ts'

export const SrpRegistrationFinishClientRequestDtoSchema =
  SrpUserAuthenticatorDtoSchema
export const PasskeyRegistrationFinishClientRequestDtoSchema = z.object({
  response: RegistrationResponseJSONSchema,
})

export const RegistrationFinishClientRequestDtoSchema = z.discriminatedUnion(
  'method',
  [
    SrpRegistrationFinishClientRequestDtoSchema.extend({
      method: z.literal(AuthMethod.Srp),
    }).meta(SRP_API_META),
    PasskeyRegistrationFinishClientRequestDtoSchema.extend({
      method: z.literal(AuthMethod.Passkey),
    }).meta(PASSKEY_API_META),
  ],
)
export type RegistrationFinishClientRequestDto = z.Infer<
  typeof RegistrationFinishClientRequestDtoSchema
>

export const RegistrationFinishInputSchema = z.object({
  clientData: RegistrationFinishClientRequestDtoSchema,
  cacheData: RegistrationCacheDtoSchema,
})
export type RegistrationFinishInput = z.Infer<
  typeof RegistrationFinishInputSchema
>

export const RegistrationFinishSuccessDtoSchema = z.object({
  authenticatorData: UserAuthenticatorDtoSchema,
})
export type RegistrationFinishSuccessDto = z.Infer<
  typeof RegistrationFinishSuccessDtoSchema
>
