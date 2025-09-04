import z from 'zod'
import { AuthMethod } from '@/model/domain/auth.ts'

export const RegistrationCache = z.object({
  challenge: z.base64url(),
})

export const RegistrationCacheDtoSchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal(AuthMethod.Srp),
  }),
  RegistrationCache.extend({
    method: z.literal(AuthMethod.Passkey),
  }),
])
export type RegistrationCacheDto = z.Infer<typeof RegistrationCacheDtoSchema>
