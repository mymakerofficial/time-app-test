import { Elysia, ValidationError as ElysiaValidationError } from 'elysia'
import { authController } from '@/modules/auth/controller.ts'
import { usersController } from '@/modules/users/controller.ts'
import { ApiError } from '@time-app-test/shared/error/apiError.ts'
import {
  PathNotFound,
  UnexpectedError,
  ValidationError,
} from '@time-app-test/shared/error/errors.ts'

export const apiController = new Elysia({ prefix: '/api' })
  .error({
    API_ERROR: ApiError,
  })
  .onError(({ code, error, path }) => {
    console.error(code, path, error)

    if (code === 'API_ERROR') {
      return error.withPath(path).toFetchResponse()
    } else if (code === 404) {
      return PathNotFound({ path }).toFetchResponse()
    } else if (
      code === 'VALIDATION' &&
      error instanceof ElysiaValidationError
    ) {
      const errors = error.all
      const firstError = errors[0]
      return ValidationError(
        {
          path: 'path' in firstError ? firstError.path : undefined,
          message: firstError.summary,
        },
        { cause: errors, path },
      ).toFetchResponse()
    }

    return UnexpectedError({ cause: error }).withPath(path).toFetchResponse()
  })
  .use(authController)
  .use(usersController)
