import { nanoid } from 'nanoid'
import { SyncStatus } from '@time-app-test/shared/model/domain/notes.ts'
import { useSession } from '@/lib/application/session/sessionStore.ts'
import { notesCollection } from '@/lib/collections'

export function useCreateNote() {
  const { getUserId } = useSession()

  return ({ message }: { message: string }) => {
    notesCollection.insert({
      id: nanoid(),
      userId: getUserId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: SyncStatus.Pending,
      deleted: false,
      message,
      attachments: [],
    })
  }
}
