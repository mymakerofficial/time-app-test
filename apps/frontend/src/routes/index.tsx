import { createFileRoute } from '@tanstack/react-router'
import { NotesView } from '@/lib/components/main/NotesView.tsx'
import { WriteNoteForm } from '@/lib/components/main/WriteNoteForm.tsx'
import { AppHeader } from '@/lib/components/main/AppHeader.tsx'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="flex flex-col min-h-screen max-h-screen">
      <AppHeader />
      <NotesView className="flex-1" />
      <div className="min-h-16 border-t border-accent">
        <WriteNoteForm className="h-full max-w-2xl mx-auto" />
      </div>
    </div>
  )
}
