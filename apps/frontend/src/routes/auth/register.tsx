import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useRegister } from '@/lib/hooks/auth/useRegister.ts'
import { useRegisterForm } from '@/lib/hooks/form/useRegisterForm.ts'
import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'

export const Route = createFileRoute('/auth/register')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { mutateAsync: register, error } = useRegister({
    onSuccess: () =>
      navigate({
        to: '/',
      }),
  })
  const form = useRegisterForm({
    onSubmit: (values) =>
      register({
        ...values,
        method: values.password.length ? AuthMethod.Srp : AuthMethod.Passkey,
      }),
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
          {(field) => <field.TextField label="Password (Optional)" />}
        </form.AppField>
        <div className="flex items-center space-x-3">
          <form.AppForm>
            <form.Subscribe>
              {({ values }) => (
                <form.SubscribeButton
                  label={
                    values.password.length
                      ? 'Register with Password'
                      : 'Register with Passkey'
                  }
                />
              )}
            </form.Subscribe>
          </form.AppForm>
          <Link to="/auth/login" className="text-blue-500 hover:underline">
            Login
          </Link>
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
