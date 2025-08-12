import { useAppForm } from '@/lib/hooks/form/form.ts'
import { RegisterFormSchema, RegisterFormValues } from '@/lib/schema/form.ts'

export function useRegisterForm({
  onSubmit,
}: {
  onSubmit: (values: RegisterFormValues) => void | Promise<void>
}) {
  return useAppForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validators: {
      onBlur: RegisterFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(value)
    },
  })
}
