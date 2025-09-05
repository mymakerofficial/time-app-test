import z from 'zod'
import { AuthenticatorTransportFutureSchema } from '@/model/domain/auth/passkey.ts'
import {
  AuthMethod,
  SrpSaltSchema,
  SrpVerifierSchema,
} from '@/model/domain/auth.ts'

export const SrpUserAuthenticatorDtoSchema = z.object({
  salt: SrpSaltSchema,
  verifier: SrpVerifierSchema,
})
export type SrpUserAuthenticatorDto = z.Infer<
  typeof SrpUserAuthenticatorDtoSchema
>

export const PasskeyUserAuthenticatorDtoSchema = z.object({
  id: z.base64url(),
  publicKey: z.hex(),
  counter: z.number(),
  transports: AuthenticatorTransportFutureSchema.array().optional(),
})
export type PasskeyUserAuthenticatorDto = z.Infer<
  typeof PasskeyUserAuthenticatorDtoSchema
>

export const UserAuthenticatorDtoSchema = z.discriminatedUnion('method', [
  SrpUserAuthenticatorDtoSchema.extend({
    method: z.literal(AuthMethod.Srp),
  }),
  PasskeyUserAuthenticatorDtoSchema.extend({
    method: z.literal(AuthMethod.Passkey),
  }),
])
export type UserAuthenticatorDto = z.Infer<typeof UserAuthenticatorDtoSchema>

export const UserAuthenticatorWithIdSchema = z.object({
  id: z.nanoid(),
  data: UserAuthenticatorDtoSchema,
})
export type UserAuthenticatorWithId = z.Infer<
  typeof UserAuthenticatorWithIdSchema
>
