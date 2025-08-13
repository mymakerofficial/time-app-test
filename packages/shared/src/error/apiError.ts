import { ApiErrorResponse } from '@/error/schema.ts'
import { isError } from '@/guards.ts'

type CreateApiErrorOptions = Partial<ApiErrorResponse> &
  Pick<ApiErrorResponse, 'message'>

export class ApiError extends Error implements ApiErrorResponse {
  errorCode: string
  statusCode: number

  constructor(
    public message: string,
    options?: Omit<CreateApiErrorOptions, 'message'>,
  ) {
    super(message, {
      cause: options?.cause,
    })
    this.name = 'ApiError'
    this.errorCode = options?.errorCode ?? 'UNKNOWN_ERROR'
    this.statusCode = options?.statusCode ?? 500
  }

  static fromResponse(response: ApiErrorResponse): ApiError {
    return new ApiError(response.message, {
      cause: response.cause,
      errorCode: response.errorCode,
      statusCode: response.statusCode,
    })
  }

  static fromError(error: Error) {
    return new ApiError(error.message, {
      cause: error,
    })
  }

  static fromUnknown(error: unknown) {
    if (isApiError(error)) {
      return error
    } else if (isError(error)) {
      return ApiError.fromError(error)
    } else {
      return new ApiError(String(error))
    }
  }

  toResponse() {
    return {
      errorCode: this.errorCode,
      statusCode: this.statusCode,
      message: this.message,
      cause: this.cause,
    }
  }

  toJSON() {
    return JSON.stringify(this.toResponse())
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError
}

export function apiError({ message, ...options }: CreateApiErrorOptions) {
  return new ApiError(message, options)
}
