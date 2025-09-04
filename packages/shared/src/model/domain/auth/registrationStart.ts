import z from 'zod'
import { PublicKeyCredentialCreationOptionsJSONSchema } from '@/model/domain/auth/passkey.ts'
import { UserIdSchema, UsernameSchema } from '@/model/domain/user.ts'
import { RegistrationCacheDtoSchema } from '@/model/domain/auth/registrationCache.ts'
import {
  AuthMethod,
  PASSKEY_API_META,
  SRP_API_META,
} from '@/model/domain/auth.ts'

export const RegistrationStartInputSchema = z.object({
  userId: UserIdSchema,
  username: UsernameSchema,
})
export type RegistrationStartInput = z.Infer<
  typeof RegistrationStartInputSchema
>

export const PasskeyRegistrationStartClientResponseDtoSchema = z.object({
  options: PublicKeyCredentialCreationOptionsJSONSchema,
})

export const RegistrationStartClientResponseDtoSchema = z.discriminatedUnion(
  'method',
  [
    z
      .object({
        method: z.literal(AuthMethod.Srp),
      })
      .meta(SRP_API_META),
    PasskeyRegistrationStartClientResponseDtoSchema.extend({
      method: z.literal(AuthMethod.Passkey),
    }).meta(PASSKEY_API_META),
  ],
)

export const RegistrationStartSuccessDtoSchema = z.object({
  clientData: RegistrationStartClientResponseDtoSchema,
  cacheData: RegistrationCacheDtoSchema,
})
export type RegistrationStartSuccessDto = z.Infer<
  typeof RegistrationStartSuccessDtoSchema
>
