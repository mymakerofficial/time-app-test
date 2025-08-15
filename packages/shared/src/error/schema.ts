import z from 'zod'
import { HttpStatusCode } from '@/api/httpStatusCode.ts'

export const ApiErrorResponseSchema = z.object({
  errorCode: z.string(),
  statusCode: z.enum(HttpStatusCode),
  parameters: z.record(z.string(), z.any()),
  message: z.string(),
  cause: z.any().optional(),
  path: z.string().optional(),
})
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>
