import z from 'zod'
import { AuthenticatorTransportFutureSchema } from '@/model/domain/auth/passkey.ts'
import { UserIdSchema } from '@/model/domain/user.ts'
import {
  AuthMethod,
  SrpSaltSchema,
  SrpVerifierSchema,
} from '@/model/domain/auth.ts'

export const SrpUserAuthenticatorDtoSchema = z.object({
  salt: SrpSaltSchema,
  verifier: SrpVerifierSchema,
})
export const PasskeyUserAuthenticatorDtoSchema = z.object({
  id: z.base64url(),
  publicKey: z.hex(),
  counter: z.number(),
  transports: AuthenticatorTransportFutureSchema.array().optional(),
})

export const UserAuthenticatorDtoSchema = z.discriminatedUnion('method', [
  SrpUserAuthenticatorDtoSchema.extend({
    method: z.literal(AuthMethod.Srp),
  }),
  PasskeyUserAuthenticatorDtoSchema.extend({
    method: z.literal(AuthMethod.Passkey),
  }),
])
export type UserAuthenticatorDto = z.Infer<typeof UserAuthenticatorDtoSchema>

export const UserAuthenticatorWithUserIdSchema = z.object({
  userId: UserIdSchema,
  authenticator: UserAuthenticatorDtoSchema,
})
export type UserAuthenticatorUserId = z.Infer<
  typeof UserAuthenticatorWithUserIdSchema
>
