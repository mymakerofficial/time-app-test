import { SrpUserAuthenticatorDtoSchema } from '@/model/domain/auth/authenticator.ts'
import z from 'zod'
import {
  AuthMethod,
  SrpClientPublicEphemeralSchema,
} from '@/model/domain/auth.ts'

export const SrpLoginCacheDtoSchema = SrpUserAuthenticatorDtoSchema.extend({
  serverSecretEphemeral: z.hex(),
  clientPublicEphemeral: SrpClientPublicEphemeralSchema,
})
export const PasskeyLoginCacheDtoSchema = z.object({
  // TODO
})

export const LoginCacheDtoSchema = z.discriminatedUnion('method', [
  SrpLoginCacheDtoSchema.extend({
    method: z.literal(AuthMethod.Srp),
  }),
  PasskeyLoginCacheDtoSchema.extend({
    method: z.literal(AuthMethod.Passkey),
  }),
])
export type LoginCacheDto = z.Infer<typeof LoginCacheDtoSchema>
