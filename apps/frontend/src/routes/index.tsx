import { createFileRoute } from '@tanstack/react-router'
import { useNotes } from '@/lib/hooks/useNotes.ts'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { data } = useNotes()

  return (
    <div className="text-center">
      {data.map((note) => (
        <div key={note.id}>
          <p>{note.message}</p>
          <p>createdAt: {note.createdAt.toLocaleString()}</p>
          <p>updatedAt: {note.updatedAt?.toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}
