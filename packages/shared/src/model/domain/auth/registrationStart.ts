import z from 'zod'
import { PublicKeyCredentialCreationOptionsJSONSchema } from '@/model/domain/auth/passkey.ts'
import { UserIdSchema, UsernameSchema } from '@/model/domain/user.ts'
import { RegistrationCacheDtoSchema } from '@/model/domain/auth/registrationCache.ts'
import {
  AuthMethod,
  AuthMethodSchema,
  PASSKEY_API_META,
  SRP_API_META,
} from '@/model/domain/auth.ts'

export namespace RegistrationStart {
  export const ConcreteInputDtoSchema = z.object({
    username: UsernameSchema,
    method: AuthMethodSchema,
  })
  export type ConcreteInputDto = z.Infer<typeof ConcreteInputDtoSchema>

  export const StrategyInputDtoSchema = z.object({
    userId: UserIdSchema,
    username: UsernameSchema,
  })
  export type StrategyInputDto = z.Infer<typeof StrategyInputDtoSchema>

  export const PasskeyClientResponseDtoSchema = z.object({
    options: PublicKeyCredentialCreationOptionsJSONSchema,
  })

  export const ClientResponseDtoSchema = z.discriminatedUnion('method', [
    z
      .object({
        method: z.literal(AuthMethod.Srp),
      })
      .meta(SRP_API_META),
    PasskeyClientResponseDtoSchema.extend({
      method: z.literal(AuthMethod.Passkey),
    }).meta(PASSKEY_API_META),
  ])

  export const StrategyResultDtoSchema = z.object({
    clientData: ClientResponseDtoSchema,
    cacheData: RegistrationCacheDtoSchema,
  })
  export type StrategyResultDto = z.Infer<typeof StrategyResultDtoSchema>

  export const ConcreteResultDtoSchema = z.object({
    userId: UserIdSchema,
    auth: ClientResponseDtoSchema,
  })
  export type ConcreteResultDto = z.Infer<typeof ConcreteResultDtoSchema>
}
