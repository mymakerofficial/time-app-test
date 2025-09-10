import { useSession } from '@/lib/application/session/sessionStore.ts'
import { useLiveQuery } from '@tanstack/react-db'
import { notesCollection } from '@/lib/collections'
import { eq } from '@tanstack/db'

export function useNotes() {
  const { getUserIdSafe } = useSession()

  return useLiveQuery((q) =>
    q
      .from({ notes: notesCollection })
      .orderBy(({ notes }) => notes.createdAt, 'asc')
      .where(({ notes }) => eq(notes.deleted, false))
      .where(({ notes }) => eq(notes.userId, getUserIdSafe())),
  )
}
