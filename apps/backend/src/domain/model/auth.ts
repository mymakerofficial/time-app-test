import z from 'zod'

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
