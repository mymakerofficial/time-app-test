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

export const SrpLoginStartClientRequestDtoSchema = z.object({
  clientPublicEphemeral: SrpClientPublicEphemeralSchema,
})
export const PasskeyLoginStartClientRequestDtoSchema = z.object({
  // TODO
})

export const LoginStartClientRequestDtoSchema = z.discriminatedUnion('method', [
  SrpLoginStartClientRequestDtoSchema.extend({
    method: z.literal(AuthMethod.Srp),
  }).meta(SRP_API_META),
  PasskeyLoginStartClientRequestDtoSchema.extend({
    method: z.literal(AuthMethod.Passkey),
  }).meta(PASSKEY_API_META),
])
export type LoginStartClientRequestDto = z.Infer<
  typeof LoginStartClientRequestDtoSchema
>

export const LoginStartInputSchema = z.object({
  clientData: LoginStartClientRequestDtoSchema,
  authenticator: UserAuthenticatorDtoSchema,
})
export type LoginStartInput = z.Infer<typeof LoginStartInputSchema>

export const SrpLoginStartClientResponseDtoSchema = z.object({
  salt: SrpSaltSchema,
  serverPublicEphemeral: SrpServerPublicEphemeralSchema,
})
export const PasskeyLoginStartClientResponseDtoSchema = z.object({})

export const LoginStartClientResponseDtoSchema = z.discriminatedUnion(
  'method',
  [
    SrpLoginStartClientResponseDtoSchema.extend({
      method: z.literal(AuthMethod.Srp),
    }).meta(SRP_API_META),
    PasskeyLoginStartClientResponseDtoSchema.extend({
      method: z.literal(AuthMethod.Passkey),
    }).meta(PASSKEY_API_META),
  ],
)
export type LoginStartClientResponseDto = z.Infer<
  typeof LoginStartClientResponseDtoSchema
>

export const LoginStartSuccessDtoSchema = z.object({
  cacheData: LoginCacheDtoSchema,
  clientData: LoginStartClientResponseDtoSchema,
})
export type LoginStartSuccessDto = z.Infer<typeof LoginStartSuccessDtoSchema>
