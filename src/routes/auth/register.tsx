import { createFileRoute } from '@tanstack/react-router'
import { useRegister } from '@/lib/hooks/auth/useRegister.ts'
import { useRegisterForm } from '@/lib/hooks/form/useRegisterForm.ts'

export const Route = createFileRoute('/auth/register')({
  component: RouteComponent,
})

function RouteComponent() {
  const { mutateAsync: register } = useRegister()
  const form = useRegisterForm({
    onSubmit: register,
  })

  return (
    <div>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          await form.handleSubmit()
        }}
        className="space-y-6"
      >
        <form.AppField name="username">
          {(field) => <field.TextField label="username" />}
        </form.AppField>
        <form.AppField name="password">
          {(field) => <field.TextField label="password" />}
        </form.AppField>
        <form.AppForm>
          <form.SubscribeButton label="Register" />
        </form.AppForm>
      </form>
    </div>
  )
}
