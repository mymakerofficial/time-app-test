import z from 'zod'

export const RegisterFormSchema = z.object({
  username: z.string(),
  password: z.string(),
})
export type RegisterFormValues = z.infer<typeof RegisterFormSchema>

export const LoginFormSchema = z.object({
  username: z.string(),
  password: z.string(),
})
export type LoginFormValues = z.infer<typeof LoginFormSchema>
