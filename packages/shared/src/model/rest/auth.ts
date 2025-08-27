import z from 'zod'
import { UserIdSchema, UsernameSchema } from '@/model/domain/user.ts'

export const RegisterStartBodySchema = z.object({
  username: UsernameSchema,
})
export type RegisterStartBody = z.Infer<typeof RegisterStartBodySchema>

export const RegisterStartResponseSchema = z.object({
  userId: UserIdSchema,
})

export const RegisterFinishBodySchema = z.object({
  username: UsernameSchema,
  userId: UserIdSchema,
  salt: z.string(),
  verifier: z.string(),
})
export type RegisterFinishBody = z.Infer<typeof RegisterFinishBodySchema>

export const LoginStartBodySchema = z.object({
  username: UsernameSchema,
  clientPublicEphemeral: z.string(),
})
export type LoginStartBody = z.Infer<typeof LoginStartBodySchema>

export const LoginStartResponseSchema = z.object({
  userId: UserIdSchema,
  salt: z.string(),
  serverPublicEphemeral: z.string(),
})

export const LoginFinishBodySchema = z.object({
  userId: UserIdSchema,
  clientProof: z.string(),
})
export type LoginFinishBody = z.Infer<typeof LoginFinishBodySchema>

export const LoginFinishResponseSchema = z.object({
  serverProof: z.string(),
  accessToken: z.string(),
})

export const GetTokenResponseSchema = z.object({
  accessToken: z.string(),
})
