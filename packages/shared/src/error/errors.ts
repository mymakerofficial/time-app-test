import z from 'zod'
import { ApiError } from '@/error/apiError.ts'
import { HttpStatusCode } from '@/api/httpStatusCode.ts'

type CreateErrorConfigWithParameters<
  TStatusCode extends HttpStatusCode,
  TParameters extends z.ZodObject | undefined,
> = {
  statusCode: TStatusCode
  parameters: TParameters
  message: (parameters: z.infer<TParameters>) => string
}

type CreateErrorConfigWithoutParameters<TStatusCode extends HttpStatusCode> = {
  statusCode: TStatusCode
  message: string
}

type CreateErrorConfig<
  TStatusCode extends HttpStatusCode,
  TParameters extends z.ZodObject | undefined,
> =
  | CreateErrorConfigWithParameters<TStatusCode, TParameters>
  | CreateErrorConfigWithoutParameters<TStatusCode>

type ErrorConstructorOptions = {
  cause?: unknown
  path?: string | undefined
}

type ErrorConstructorExtension<
  TErrorCode extends string,
  TStatusCode extends HttpStatusCode,
> = {
  errorCode: TErrorCode
  statusCode: TStatusCode
}

function createError<
  TErrorCode extends string,
  TStatusCode extends HttpStatusCode,
  TParameters extends z.ZodObject,
>(
  errorCode: TErrorCode,
  config: CreateErrorConfigWithParameters<TStatusCode, TParameters>,
): ((
  parameters: z.infer<TParameters>,
  options?: ErrorConstructorOptions,
) => ApiError<TErrorCode, TStatusCode, z.Infer<TParameters>>) &
  ErrorConstructorExtension<TErrorCode, TStatusCode>
function createError<
  TErrorCode extends string,
  TStatusCode extends HttpStatusCode,
>(
  errorCode: TErrorCode,
  config: CreateErrorConfigWithoutParameters<TStatusCode>,
): ((options?: ErrorConstructorOptions) => ApiError<TErrorCode, TStatusCode>) &
  ErrorConstructorExtension<TErrorCode, TStatusCode>
function createError<
  TErrorCode extends string,
  TStatusCode extends HttpStatusCode,
  TParameters extends z.ZodObject,
>(errorCode: TErrorCode, config: CreateErrorConfig<TStatusCode, TParameters>) {
  if ('parameters' in config) {
    const constructor = (
      parameters: z.infer<TParameters>,
      options?: ErrorConstructorOptions,
    ) => {
      return new ApiError(config.message(parameters), {
        errorCode,
        statusCode: config.statusCode,
        parameters,
        cause: options?.cause,
        path: options?.path,
      })
    }

    return Object.assign(constructor, {
      errorCode,
      statusCode: config.statusCode,
    })
  }

  const constructor = (options?: ErrorConstructorOptions) => {
    return new ApiError(config.message, {
      errorCode,
      statusCode: config.statusCode,
      cause: options?.cause,
      path: options?.path,
    })
  }
  return Object.assign(constructor, {
    errorCode,
    statusCode: config.statusCode,
  })
}

export const UnexpectedError = createError('UNEXPECTED_ERROR', {
  statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
  message: 'Something went wrong.',
})

export const PathNotFound = createError('PATH_NOT_FOUND', {
  statusCode: HttpStatusCode.NOT_FOUND,
  message: 'The requested route does not exist.',
})
export const ValidationError = createError('VALIDATION_ERROR', {
  statusCode: HttpStatusCode.UNPROCESSABLE_ENTITY,
  parameters: z.object({
    path: z.string().optional(),
    message: z.string().optional(),
  }),
  message: ({ path, message }) => `${path} ${message}`,
})

export const UserNotFoundById = createError('USER_NOT_FOUND_BY_ID', {
  statusCode: HttpStatusCode.NOT_FOUND,
  parameters: z.object({ id: z.string() }),
  message: ({ id }) => `User with id '${id}' does not exist.`,
})
export const UserNotFoundByName = createError('USER_NOT_FOUND_BY_NAME', {
  statusCode: HttpStatusCode.NOT_FOUND,
  parameters: z.object({ username: z.string() }),
  message: ({ username }) => `User with username '${username}' does not exist.`,
})
export const UserAlreadyExists = createError('USER_ALREADY_EXISTS', {
  statusCode: HttpStatusCode.CONFLICT,
  parameters: z.object({ username: z.string() }),
  message: ({ username }) => `User with username '${username}' already exists.`,
})
export const InvalidRegistrationSession = createError(
  'INVALID_REGISTRATION_SESSION',
  {
    statusCode: HttpStatusCode.BAD_REQUEST,
    parameters: z.object({ userId: z.string() }),
    message: ({ userId }) =>
      `User with id '${userId}' does not have a pending registration or invalid data was provided.`,
  },
)
export const InvalidLoginSession = createError('INVALID_LOGIN_SESSION', {
  statusCode: HttpStatusCode.BAD_REQUEST,
  parameters: z.object({ userId: z.string() }),
  message: ({ userId }) =>
    `User with id '${userId}' does not have a pending login.`,
})
export const AccessDenied = createError('ACCESS_DENIED', {
  statusCode: HttpStatusCode.FORBIDDEN,
  message: 'Access denied.',
})
export const MissingAuthorizationHeader = createError(
  'MISSING_AUTHORIZATION_HEADER',
  {
    statusCode: HttpStatusCode.FORBIDDEN,
    message: 'Access denied because authorization header was missing.',
  },
)
export const InvalidJwt = createError('INVALID_JWT', {
  statusCode: HttpStatusCode.FORBIDDEN,
  message: 'Access denied because access token was invalid.',
})
