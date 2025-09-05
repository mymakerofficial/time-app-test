import { useAppForm } from './form.ts'
import { LoginFormSchema, LoginFormValues } from '../../schema/form.ts'
import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'

export function useLoginForm({
  onSubmit,
}: {
  onSubmit: (values: LoginFormValues) => void | Promise<void>
}) {
  return useAppForm({
    defaultValues: {
      username: '',
      password: '',
      method: AuthMethod.Srp,
    },
    validators: {
      onBlur: LoginFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(value)
    },
  })
}
