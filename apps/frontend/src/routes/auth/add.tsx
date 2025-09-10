import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'
import { useAddAuth } from '@/lib/hooks/auth/useAddAuth.ts'
import { useAddAuthForm } from '@/lib/hooks/form/useAddAuthForm.ts'

export const Route = createFileRoute('/auth/add')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { mutateAsync: addAuth, error } = useAddAuth({
    onSuccess: () => navigate({ to: '/' }),
  })
  const form = useAddAuthForm({
    onSubmit: (values) =>
      addAuth({
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
        <form.AppField name="password">
          {(field) => <field.TextField label="Password (Optional)" />}
        </form.AppField>
        <div className="flex items-center space-x-3">
          <form.AppForm>
            <form.Subscribe>
              {({ values }) => (
                <form.SubscribeButton
                  label={
                    values.password.length ? 'Add Password' : 'Add Passkey'
                  }
                />
              )}
            </form.Subscribe>
          </form.AppForm>
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
