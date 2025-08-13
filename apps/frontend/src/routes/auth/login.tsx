import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useLogin } from '../../lib/hooks/auth/useLogin.ts'
import { useLoginForm } from '../../lib/hooks/form/useLoginForm.ts'

export const Route = createFileRoute('/auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { mutateAsync: login, error } = useLogin({
    onSuccess: () => navigate({ to: '/me' }),
  })
  const form = useLoginForm({
    onSubmit: login,
  })

  return (
    <div className="max-w-md mx-auto mt-10 p-6 space-y-6">
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          await form.handleSubmit()
        }}
        className="space-y-6"
      >
        <form.AppField name="username">
          {(field) => <field.TextField label="Username" />}
        </form.AppField>
        <form.AppField name="password">
          {(field) => <field.TextField label="Password" />}
        </form.AppField>
        <div className="flex items-center space-x-3">
          <form.AppForm>
            <form.SubscribeButton label="Login" />
          </form.AppForm>
          <a href="/auth/register" className="text-blue-500 hover:underline">
            Register
          </a>
        </div>
      </form>
      {error && (
        <div className="text-red-500 mt-4">
          {error.message || 'An unknown error occurred.'}
        </div>
      )}
    </div>
  )
}
