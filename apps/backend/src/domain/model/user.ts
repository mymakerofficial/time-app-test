import z from 'zod'

export const UserSchema = z.object({
  id: z.nanoid(),
  username: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type User = z.Infer<typeof UserSchema>

export const UserAuthMetaSchema = z.object({
  id: z.nanoid(),
  username: z.string(),
  salt: z.string(),
  verifier: z.string(),
})
export type UserAuthMeta = z.Infer<typeof UserAuthMetaSchema>

export const CreateUserSchema = z.object({
  id: z.nanoid(),
  username: z.string(),
  salt: z.string(),
  verifier: z.string(),
})
export type CreateUser = z.Infer<typeof CreateUserSchema>
