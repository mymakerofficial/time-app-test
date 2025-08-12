import { createFileRoute } from '@tanstack/react-router'
import { useRegister } from '@/lib/hooks/auth/useRegister.ts'
import { useRegisterForm } from '@/lib/hooks/form/useRegisterForm.ts'
import { useMe } from '@/lib/hooks/useMe.ts'

export const Route = createFileRoute('/auth/register')({
  component: RouteComponent,
})

function RouteComponent() {
  const { mutateAsync: register, error } = useRegister()
  const form = useRegisterForm({
    onSubmit: register,
  })
  const { data: me } = useMe()

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
            <form.SubscribeButton label="Register" />
          </form.AppForm>
          <a href="/auth/login" className="text-blue-500 hover:underline">
            Login
          </a>
        </div>
      </form>
      {error && (
        <div className="text-red-500 mt-4">
          {error.message || 'An unknown error occurred.'}
        </div>
      )}
      <div>{JSON.stringify(me)}</div>
    </div>
  )
}
