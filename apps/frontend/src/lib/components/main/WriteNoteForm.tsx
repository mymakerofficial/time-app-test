import { useAppForm } from '@/lib/hooks/form/form.ts'
import z from 'zod'
import { NoteMessageSchema } from '@time-app-test/shared/model/domain/notes.ts'
import { useCreateNote } from '@/lib/hooks/notes/useCreateNote.ts'
import { cn } from '@/lib/utils'
import { FileIcon, FilePlusIcon } from 'lucide-react'

export function WriteNoteForm({ className }: { className?: string }) {
  const createNote = useCreateNote()

  const form = useAppForm({
    defaultValues: {
      files: [] as File[],
      message: '',
    },
    validators: {
      onBlur: z.object({
        files: z.file().array(),
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
      className={cn('flex flex-col gap-6 py-6', className)}
    >
      <form.Subscribe>
        {({ values }) =>
          !!values.files.length && (
            <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
              {values.files.map((file) => (
                <div
                  key={file.name}
                  className="p-2 rounded bg-accent flex gap-2 items-center"
                >
                  <FileIcon className="size-4" />
                  <p>{file.name}</p>
                </div>
              ))}
            </div>
          )
        }
      </form.Subscribe>
      <div className="flex gap-6 items-center">
        <form.AppField name="files">
          {(field) => (
            <field.FileField
              label={
                <>
                  <FilePlusIcon className="size-4" />
                  <p className="sr-only">Add File</p>
                </>
              }
            />
          )}
        </form.AppField>
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
        <form.AppForm>
          <form.SubscribeButton label="Submit" />
        </form.AppForm>
      </div>
    </form>
  )
}
