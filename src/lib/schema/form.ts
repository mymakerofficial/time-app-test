import z from 'zod'

export const RegisterFormSchema = z.object({
  username: z.string(),
  password: z.string(),
})
export type RegisterFormValues = z.infer<typeof RegisterFormSchema>
