import { ApiErrorResponse, ApiErrorResponseSchema } from './schema/error.ts'

export type ApiErrorProps = ApiErrorResponse & {
  statusCode?: number
}

export class ApiError extends Error implements ApiErrorProps {
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

  static from(props: ApiErrorProps): ApiError {
    return new ApiError(props.message, {
      cause: props.cause,
      errorCode: props.errorCode,
      statusCode: props.statusCode ?? 500,
    })
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

  toJSON() {
    return JSON.stringify(
      ApiErrorResponseSchema.parse({
        errorCode: this.errorCode,
        message: this.message,
        cause: this.cause,
      }),
    )
  }

  toProps() {
    return {
      statusCode: this.statusCode,
      errorCode: this.errorCode,
      message: this.message,
      cause: this.cause,
    }
  }

  map(mapFn: (originalErr: ApiError) => Partial<ApiErrorProps>) {
    return ApiError.from({ ...this.toProps(), ...mapFn(this) })
  }
}
