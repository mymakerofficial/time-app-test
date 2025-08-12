import z from 'zod'

export const ApiErrorResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  cause: z.any().optional(),
})
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>
