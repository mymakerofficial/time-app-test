import z from 'zod'

export const CookieSchema = z.object({
  value: z.string(),
  maxAge: z.number(),
})
export type CookieDto = z.Infer<typeof CookieSchema>
