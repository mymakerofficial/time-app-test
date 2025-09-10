import { useAppForm } from '@/lib/hooks/form/form.ts'
import z from 'zod'
import { NoteMessageSchema } from '@time-app-test/shared/model/domain/notes.ts'
import { useCreateNote } from '@/lib/hooks/notes/useCreateNote.ts'
import { cn } from '@/lib/utils'

export function WriteNoteForm({ className }: { className?: string }) {
  const createNote = useCreateNote()

  const form = useAppForm({
    defaultValues: {
      message: '',
    },
    validators: {
      onBlur: z.object({
        message: NoteMessageSchema,
      }),
    },
    onSubmit: ({ value, formApi: { reset } }) => {
      createNote(value)
      reset()
    },
  })

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        e.stopPropagation()
        await form.handleSubmit()
      }}
      className={cn('flex gap-6 items-center px-6', className)}
    >
      <form.AppField name="message">
        {(field) => (
          <field.TextField
            label="Message"
            placeholder="Type something nice..."
            labelHidden
            className="flex-1"
          />
        )}
      </form.AppField>
      <div className="flex items-center space-x-3">
        <form.AppForm>
          <form.SubscribeButton label="Submit" />
        </form.AppForm>
      </div>
    </form>
  )
}
