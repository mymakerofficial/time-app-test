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
import { UserIdSchema, UsernameSchema } from '@/model/domain/user.ts'
import { EncryptionPublicDtoSchema } from '@/model/domain/auth/encryption.ts'

export namespace RegistrationFinish {
  export const SrpClientRequestDtoSchema = SrpUserAuthenticatorDtoSchema
  export const PasskeyClientRequestDtoSchema = z.object({
    response: RegistrationResponseJSONSchema,
  })

  export const ClientRequestDtoSchema = z.discriminatedUnion('method', [
    SrpClientRequestDtoSchema.extend({
      method: z.literal(AuthMethod.Srp),
    }).meta(SRP_API_META),
    PasskeyClientRequestDtoSchema.extend({
      method: z.literal(AuthMethod.Passkey),
    }).meta(PASSKEY_API_META),
  ])

  export const ConcreteInputDtoSchema = z.object({
    username: UsernameSchema,
    userId: UserIdSchema,
    auth: ClientRequestDtoSchema,
    encryption: EncryptionPublicDtoSchema,
  })
  export type ConcreteInputDto = z.Infer<typeof ConcreteInputDtoSchema>

  export const StrategyInputDtoSchema = z.object({
    clientData: ClientRequestDtoSchema,
    cacheData: RegistrationCacheDtoSchema,
  })
  export type StrategyInputDto = z.Infer<typeof StrategyInputDtoSchema>

  export const StrategyResultDtoSchema = z.object({
    authenticatorData: UserAuthenticatorDtoSchema,
  })
  export type StrategyResultDto = z.Infer<typeof StrategyResultDtoSchema>
}
