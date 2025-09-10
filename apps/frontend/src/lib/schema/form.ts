import z from 'zod'
import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'

export type WithAuthMethod<T extends object> = T & { method: AuthMethod }

export const RegisterFormSchema = z.object({
  username: z.string(),
  password: z.string(),
})
export type RegisterFormValues = z.infer<typeof RegisterFormSchema>

export const AddAuthFormSchema = z.object({
  password: z.string(),
})
export type AddAuthFormValues = z.infer<typeof AddAuthFormSchema>

export const LoginFormSchema = z.object({
  username: z.string(),
  password: z.string(),
})
export type LoginFormValues = z.infer<typeof LoginFormSchema>
