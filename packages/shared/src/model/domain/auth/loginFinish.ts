import z from 'zod'
import {
  AuthMethod,
  JwtAccessTokenSchema,
  PASSKEY_API_META,
  SRP_API_META,
  SrpClientProofSchema,
  SrpServerProofSchema,
} from '@/model/domain/auth.ts'
import { UserIdSchema } from '@/model/domain/user.ts'
import { LoginCacheDtoSchema } from '@/model/domain/auth/loginCache.ts'
import { EncryptionPublicDtoSchema } from '@/model/domain/auth/encryption.ts'
import { CookieSchema } from '@/model/domain/cookie.ts'

export namespace LoginFinish {
  export const SrpClientRequestDtoSchema = z.object({
    clientProof: SrpClientProofSchema,
  })
  export const PasskeyClientRequestDtoSchema = z.object({
    // TODO
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
    userId: UserIdSchema,
    auth: ClientRequestDtoSchema,
  })
  export type ConcreteInputDto = z.Infer<typeof ConcreteInputDtoSchema>

  export const StrategyInputDtoSchema = z.object({
    userId: UserIdSchema,
    clientData: ClientRequestDtoSchema,
    cacheData: LoginCacheDtoSchema,
  })
  export type StrategyInputDto = z.Infer<typeof StrategyInputDtoSchema>

  export const SrpClientResponseDtoSchema = z.object({
    serverProof: SrpServerProofSchema,
  })
  export const PasskeyClientResponseDtoSchema = z.object({
    // TODO
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
    clientData: ClientResponseDtoSchema,
  })
  export type StrategyResultDto = z.Infer<typeof StrategyResultDtoSchema>

  export const ConcreteResultDtoSchema = z.object({
    auth: ClientResponseDtoSchema,
    encryption: EncryptionPublicDtoSchema,
    accessToken: JwtAccessTokenSchema,
    refreshToken: CookieSchema,
  })
  export type ConcreteResultDto = z.Infer<typeof ConcreteResultDtoSchema>
}
