import { useAppForm } from './form.ts'
import { AddAuthFormSchema, AddAuthFormValues } from '../../schema/form.ts'
import { AuthMethod } from '@time-app-test/shared/model/domain/auth.ts'

export function useAddAuthForm({
  onSubmit,
}: {
  onSubmit: (values: AddAuthFormValues) => void | Promise<void>
}) {
  return useAppForm({
    defaultValues: {
      password: '',
      method: AuthMethod.Passkey,
    },
    validators: {
      onBlur: AddAuthFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(value)
    },
  })
}
