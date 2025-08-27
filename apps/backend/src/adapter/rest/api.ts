import { Elysia, ValidationError as ElysiaValidationError } from 'elysia'
import { authController } from '@/adapter/rest/controller/authController.ts'
import { usersController } from '@/adapter/rest/controller/usersController.ts'
import { ApiError } from '@time-app-test/shared/error/apiError.ts'
import {
  PathNotFound,
  UnexpectedError,
  ValidationError,
} from '@time-app-test/shared/error/errors.ts'
import { timeEntriesController } from '@/adapter/rest/controller/timeEntriesController.ts'
import { DrizzleQueryError } from 'drizzle-orm/errors'
import { notesController } from '@/adapter/rest/controller/notesController.ts'
import { ZodError } from 'zod'

export const apiController = new Elysia({ prefix: '/api' })
  .error({
    API_ERROR: ApiError,
    DRIZZLE_QUERY_ERROR: DrizzleQueryError,
  })
  .onError(({ code, error, path }) => {
    console.error(path, code, error)

    if (code === 'API_ERROR') {
      // if (error.statusCode === HttpStatusCode.FORBIDDEN) {
      //   return AccessDenied().toFetchResponse()
      // }
      return error.withPath(path).toFetchResponse()
    } else if (code === 404) {
      return PathNotFound({ path }).toFetchResponse()
    } else if (code === 'UNKNOWN' && error instanceof ZodError) {
      const issues = error.issues
      const firstIssue = issues[0]
      return ValidationError(
        {
          path: firstIssue.path.join('.'),
          message: firstIssue.message,
        },
        { cause: issues, path },
      ).toFetchResponse()
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
  .use(timeEntriesController)
  .use(notesController)
