import { useAppForm } from '@/lib/hooks/form/form.ts'
import { LoginFormSchema, LoginFormValues } from '@/lib/schema/form.ts'

export function useLoginForm({
  onSubmit,
}: {
  onSubmit: (values: LoginFormValues) => void | Promise<void>
}) {
  return useAppForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validators: {
      onBlur: LoginFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(value)
    },
  })
}
