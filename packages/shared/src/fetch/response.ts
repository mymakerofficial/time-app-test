import { z } from 'zod'
import { ApiErrorResponseSchema } from '@/error/schema.ts'
import { apiError } from '@/error/apiError.ts'

export async function getResponseBody<T extends z.ZodTypeAny>({
  response,
  schema,
}: {
  response: Response
  schema: T
}): Promise<z.infer<T>> {
  const data = await response.json()
  if (!response.ok) {
    const errorResponse = ApiErrorResponseSchema.safeParse(data)
    if (errorResponse.success) {
      throw apiError({
        ...errorResponse.data,
        statusCode: response.status,
      })
    } else {
      throw apiError({
        message: 'Something went wrong.',
        statusCode: response.status,
      })
    }
  }
  return schema.parse(data)
}
