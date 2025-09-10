import { useAppForm } from './form.ts'
import { AddAuthFormSchema, AddAuthFormValues } from '../../schema/form.ts'

export function useAddAuthForm({
  onSubmit,
}: {
  onSubmit: (values: AddAuthFormValues) => void | Promise<void>
}) {
  return useAppForm({
    defaultValues: {
      password: '',
    },
    validators: {
      onBlur: AddAuthFormSchema,
    },
    onSubmit: ({ value }) => {
      onSubmit(value)
    },
  })
}
