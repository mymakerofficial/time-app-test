import { ApiErrorResponse } from '@/error/schema.ts'
import { HttpStatusCode } from '@/api/httpStatusCode.ts'
import { UnexpectedError } from '@/error/errors.ts'

type CreateApiErrorOptions<
  TErrorCode extends string,
  TStatusCode extends HttpStatusCode,
  TParameters extends Record<string, unknown> = {},
> = {
  errorCode: TErrorCode
  statusCode: TStatusCode
  parameters?: TParameters
  cause?: unknown
  path?: string
}
export class ApiError<
    TErrorCode extends string,
    TStatusCode extends HttpStatusCode,
    TParameters extends Record<string, unknown> = {},
  >
  extends Error
  implements ApiErrorResponse
{
  errorCode: TErrorCode
  statusCode: TStatusCode
  parameters: TParameters
  path: string | undefined

  constructor(
    public message: string,
    options: CreateApiErrorOptions<TErrorCode, TStatusCode, TParameters>,
  ) {
    super(message, {
      cause: options?.cause,
    })
    this.name = 'ApiError'
    this.errorCode = options?.errorCode
    this.statusCode = options?.statusCode
    this.parameters = options?.parameters ?? ({} as TParameters)
    this.path = options?.path
  }

  static from(error: unknown) {
    if (error instanceof ApiError) {
      return error
    } else if (error instanceof Error) {
      return new ApiError(error.message, {
        errorCode: error.name,
        statusCode: 500,
        cause: error,
      })
    } else {
      return UnexpectedError()
    }
  }

  withPath(path: string) {
    const { message, ...options } = this.getProps()
    return new ApiError(message, { ...options, path })
  }

  withStatusCode(statusCode: HttpStatusCode) {
    const { message, ...options } = this.getProps()
    return new ApiError(message, { ...options, statusCode })
  }

  getProps(): ApiErrorResponse {
    return {
      message: this.message,
      errorCode: this.errorCode,
      statusCode: this.statusCode,
      parameters: this.parameters,
      path: this.path,
      cause: this.cause,
    }
  }

  toJSON() {
    return JSON.stringify(this.getProps())
  }

  toFetchResponse() {
    return new Response(this.toJSON(), {
      status: this.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
