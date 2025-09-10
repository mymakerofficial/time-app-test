import { useLogout } from '@/lib/hooks/auth/useLogout.ts'
import { useNavigate } from '@tanstack/react-router'
import { DefaultError } from '@tanstack/react-query'
import { ApiError } from '@time-app-test/shared/error/apiError.ts'

type ErrorHandler<
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
> = (
  error: TError,
  variables: TVariables,
  context: TContext | undefined,
) => Promise<unknown> | unknown

export function useHandleAuthError() {
  const navigate = useNavigate()
  const { mutateAsync: logout } = useLogout()

  return async (error: unknown) => {
    if (error instanceof ApiError && error.statusCode === 401) {
      await logout()
      await navigate({ to: '/auth/login' })
    }
  }
}

export function useHandleMutationAuthError() {
  const handleAuthError = useHandleAuthError()

  return <TError = DefaultError, TVariables = void, TContext = unknown>(
    handler?: ErrorHandler<TError, TVariables, TContext>,
  ): ErrorHandler<TError, TVariables, TContext> => {
    return async (
      error: TError,
      variables: TVariables,
      context: TContext | undefined,
    ) => {
      await handler?.(error, variables, context)
      await handleAuthError(error)
    }
  }
}
