import { z } from 'zod'
import { ApiErrorResponseSchema } from '@/error/schema.ts'
import { ApiError } from '@/error/apiError.ts'
import { HttpStatusCode } from '@/api/httpStatusCode.ts'
import { UnexpectedError } from '@/error/errors.ts'

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
      throw new ApiError(errorResponse.data.message, {
        errorCode: errorResponse.data.errorCode,
        statusCode: errorResponse.data.statusCode,
        parameters: errorResponse.data.parameters,
        cause: errorResponse.data.cause,
        path: errorResponse.data.path,
      })
    } else {
      throw UnexpectedError({
        cause: errorResponse.data,
        path: response.url,
      }).withStatusCode(response.status as HttpStatusCode)
    }
  }
  return schema.parse(data)
}
