import z from 'zod'
import { nanoid } from 'nanoid'

export const UserIdSchema = z
  .nanoid()
  .describe('the id of a user')
  .meta({
    examples: [nanoid()],
  })

export const UsernameSchema = z
  .string()
  .min(1)
  .describe('the name of a user')
  .meta({
    examples: ['My_Maker'],
  })

export const UserSchema = z.object({
  id: UserIdSchema,
  username: UsernameSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
})
export type User = z.Infer<typeof UserSchema>

export const CreateUserSchema = z.object({
  id: UserIdSchema,
  username: UsernameSchema,
})
export type CreateUser = z.Infer<typeof CreateUserSchema>
