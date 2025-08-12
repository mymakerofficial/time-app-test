import { ApiErrorResponse, ApiErrorResponseSchema } from '@/lib/schema/error.ts'

export class ApiError extends Error {
  errorCode: string
  statusCode: number

  constructor(
    public message: string,
    options?: {
      cause?: Error
      errorCode?: string
      statusCode?: number
    },
  ) {
    super(message, {
      cause: options?.cause,
    })
    this.name = 'ApiError'
    this.errorCode = options?.errorCode ?? 'UNKNOWN_ERROR'
    this.statusCode = options?.statusCode ?? 500
  }

  static fromError(error: Error) {
    return new ApiError(error.message, {
      cause: error,
    })
  }

  static fromUnknown(error: unknown) {
    if (error instanceof ApiError) {
      return error
    } else if (error instanceof Error) {
      return ApiError.fromError(error)
    } else {
      return new ApiError(String(error))
    }
  }

  static fromApiErrorResponse(response: ApiErrorResponse): ApiError {
    return new ApiError(response.message, {
      cause: response.cause,
      errorCode: response.code,
      statusCode: 500,
    })
  }

  toJSON() {
    return JSON.stringify(
      ApiErrorResponseSchema.parse({
        code: this.errorCode,
        message: this.message,
        cause: this.cause,
      }),
    )
  }
}
