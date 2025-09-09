import z from 'zod'
import { AuthMethodSchema } from '@time-app-test/shared/model/domain/auth.ts'

export const RegisterFormSchema = z.object({
  username: z.string(),
  password: z.string(),
  method: AuthMethodSchema,
})
export type RegisterFormValues = z.infer<typeof RegisterFormSchema>

export const AddAuthFormSchema = z.object({
  password: z.string(),
  method: AuthMethodSchema,
})
export type AddAuthFormValues = z.infer<typeof AddAuthFormSchema>

export const LoginFormSchema = z.object({
  username: z.string(),
  password: z.string(),
  method: AuthMethodSchema,
})
export type LoginFormValues = z.infer<typeof LoginFormSchema>
