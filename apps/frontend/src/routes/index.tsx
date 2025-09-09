import { createFileRoute, Link } from '@tanstack/react-router'
import { useNotes } from '@/lib/hooks/notes/useNotes.ts'
import { useCreateNote } from '@/lib/hooks/notes/useCreateNote.ts'
import { useAppForm } from '@/lib/hooks/form/form.ts'
import z from 'zod'
import { NoteMessageSchema } from '@time-app-test/shared/model/domain/notes.ts'
import { useMe } from '@/lib/hooks/useMe.ts'
import { useLogout } from '@/lib/hooks/auth/useLogout.ts'
import { Button } from '@/lib/components/ui/button.tsx'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { data: me } = useMe()
  const { mutate: logout } = useLogout()
  const { data: notes } = useNotes()
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
    <div className="max-w-md mx-auto mt-10 p-6 space-y-6">
      <h1 className="text-2xl font-bold">You are</h1>
      <pre>{JSON.stringify(me) || 'Not logged in :('}</pre>
      <div className="flex items-center space-x-3">
        <Button onClick={() => logout()}>Logout</Button>
        <Link to="/auth/login" className="text-blue-500 hover:underline">
          Login
        </Link>
        <Link to="/auth/add" className="text-blue-500 hover:underline">
          Add Authentication Method
        </Link>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          await form.handleSubmit()
        }}
        className="space-y-6"
      >
        <form.AppField name="message">
          {(field) => <field.TextField label="Message" />}
        </form.AppField>
        <div className="flex items-center space-x-3">
          <form.AppForm>
            <form.SubscribeButton label="Submit" />
          </form.AppForm>
        </div>
      </form>
      {notes.map((note) => (
        <div key={note.id}>
          <p className="font-bold">{note.message}</p>
          <p>createdAt: {note.createdAt.toLocaleString()}</p>
          <p>updatedAt: {note.updatedAt.toLocaleString()}</p>
          <p>syncStatus: {note.syncStatus}</p>
        </div>
      ))}
    </div>
  )
}
