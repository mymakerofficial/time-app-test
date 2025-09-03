import { useAppForm } from './form.ts'
import { RegisterFormSchema, RegisterFormValues } from '../../schema/form.ts'
import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'

export function useRegisterForm({
  onSubmit,
}: {
  onSubmit: (values: RegisterFormValues) => void | Promise<void>
}) {
  return useAppForm({
    defaultValues: {
      username: '',
      password: '',
      method: AuthMethod.Srp,
    },
    validators: {
      onBlur: RegisterFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(value)
    },
  })
}
