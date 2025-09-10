import { Button } from '@/lib/components/ui/button.tsx'
import { useNavigate } from '@tanstack/react-router'
import { ApiError } from '@time-app-test/shared/error/apiError.ts'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { PropsWithChildren } from 'react'

export function FallbackComponent({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const navigate = useNavigate()

  const apiError = ApiError.from(error)

  return (
    <div role="alert" className="max-w-md mx-auto mt-10 p-6 space-y-6">
      <h1 className="text-red-500 text-3xl font-bold">{apiError.statusCode}</h1>
      <p className="text-red-500">{apiError.message}</p>
      <p className="text-red-500 text-sm">{apiError.errorCode}</p>
      <div className="flex items-center space-x-3">
        {apiError.statusCode === 401 && (
          <Button
            onClick={async () => {
              await navigate({ to: '/auth/login' })
              resetErrorBoundary()
            }}
          >
            Login
          </Button>
        )}
        <Button
          onClick={async () => {
            resetErrorBoundary()
          }}
        >
          Try Again
        </Button>
      </div>
    </div>
  )
}

export function DefaultErrorBoundary({
  children,
}: Readonly<PropsWithChildren>) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} FallbackComponent={FallbackComponent}>
          {children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
