import z from 'zod'
import { UserAuthenticatorDtoSchema } from '@/model/domain/auth/authenticator.ts'
import { LoginCacheDtoSchema } from '@/model/domain/auth/loginCache.ts'
import {
  AuthMethod,
  PASSKEY_API_META,
  SRP_API_META,
  SrpClientPublicEphemeralSchema,
  SrpSaltSchema,
  SrpServerPublicEphemeralSchema,
} from '@/model/domain/auth.ts'
import { UserIdSchema, UsernameSchema } from '@/model/domain/user.ts'
import { PublicKeyCredentialRequestOptionsJSONSchema } from '@/model/domain/auth/passkey.ts'

export namespace LoginStart {
  export const SrpClientRequestDtoSchema = z.object({
    clientPublicEphemeral: SrpClientPublicEphemeralSchema,
  })
  export const PasskeyClientRequestDtoSchema = z.object({
    // TODO probably empty
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
    auth: ClientRequestDtoSchema,
  })
  export type ConcreteInputDto = z.Infer<typeof ConcreteInputDtoSchema>

  export const StrategyInputDtoSchema = z.object({
    clientData: ClientRequestDtoSchema,
    authenticators: UserAuthenticatorDtoSchema.array(),
  })
  export type StrategyInputDto = z.Infer<typeof StrategyInputDtoSchema>

  export const SrpClientResponseDtoSchema = z.object({
    salt: SrpSaltSchema,
    serverPublicEphemeral: SrpServerPublicEphemeralSchema,
  })
  export const PasskeyClientResponseDtoSchema = z.object({
    options: PublicKeyCredentialRequestOptionsJSONSchema,
  })

  export const ClientResponseDtoSchema = z.discriminatedUnion('method', [
    SrpClientResponseDtoSchema.extend({
      method: z.literal(AuthMethod.Srp),
    }).meta(SRP_API_META),
    PasskeyClientResponseDtoSchema.extend({
      method: z.literal(AuthMethod.Passkey),
    }).meta(PASSKEY_API_META),
  ])

  export const StrategyResultDtoSchema = z.object({
    cacheData: LoginCacheDtoSchema,
    clientData: ClientResponseDtoSchema,
  })
  export type StrategyResultDto = z.Infer<typeof StrategyResultDtoSchema>

  export const ConcreteResultDtoSchema = z.object({
    userId: UserIdSchema,
    auth: ClientResponseDtoSchema,
  })
  export type ConcreteResultDto = z.Infer<typeof ConcreteResultDtoSchema>
}
