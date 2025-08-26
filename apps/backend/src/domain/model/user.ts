import z from 'zod'

export const UserSchema = z.object({
  id: z.nanoid(),
  username: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type User = z.Infer<typeof UserSchema>

export const CreateUserSchema = z.object({
  id: z.nanoid(),
  username: z.string(),
})
export type CreateUser = z.Infer<typeof CreateUserSchema>
