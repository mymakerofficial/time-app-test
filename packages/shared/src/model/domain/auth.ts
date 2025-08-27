import z from 'zod'
import { CookieSchema } from '@/model/domain/cookie.ts'

export const UserPasswordDataSchema = z.object({
  userId: z.nanoid(),
  username: z.string(),
  salt: z.string(),
  verifier: z.string(),
})
export type UserPasswordData = z.Infer<typeof UserPasswordDataSchema>

export const CreateUserPasswordDataSchema = z.object({
  userId: z.nanoid(),
  salt: z.string(),
  verifier: z.string(),
})
export type CreateUserPasswordData = z.Infer<
  typeof CreateUserPasswordDataSchema
>

export const PasswordLoginStartClientDataSchema = z.object({
  username: z.string(),
  clientPublicEphemeral: z.string(),
})
export type PasswordLoginStartClientData = z.Infer<
  typeof PasswordLoginStartClientDataSchema
>

export const PasswordLoginStartServerDataSchema = z.object({
  userId: z.nanoid(),
  salt: z.string(),
  serverPublicEphemeral: z.string(),
})
export type PasswordLoginStartServerData = z.Infer<
  typeof PasswordLoginStartServerDataSchema
>

export const PasswordLoginFinishClientDataSchema = z.object({
  userId: z.nanoid(),
  clientProof: z.string(),
})
export type PasswordLoginFinishClientData = z.Infer<
  typeof PasswordLoginFinishClientDataSchema
>

export const PasswordLoginFinishServerDataSchema = z.object({
  serverProof: z.string(),
  accessToken: z.string(),
  refreshToken: CookieSchema,
})
export type PasswordLoginFinishServerData = z.Infer<
  typeof PasswordLoginFinishServerDataSchema
>
