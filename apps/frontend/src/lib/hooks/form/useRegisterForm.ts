import { useAppForm } from './form.ts'
import { RegisterFormSchema, RegisterFormValues } from '../../schema/form.ts'

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
