import { nanoid } from 'nanoid'
import { SyncStatus } from '@time-app-test/shared/model/domain/notes.ts'
import { useSession } from '@/lib/application/session/sessionStore.ts'
import { notesCollection } from '@/lib/collections'
import { useContainer } from '@/lib/application/container'

export function useCreateNote() {
  const { getUserId } = useSession()
  const { attachmentsService } = useContainer()

  return async ({ message, files }: { message: string; files: File[] }) => {
    const attachments = await Promise.all(
      files.map(async (file) => {
        return await attachmentsService.uploadFile(file)
      }),
    )
    notesCollection.insert({
      id: nanoid(),
      userId: getUserId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: SyncStatus.Pending,
      deleted: false,
      message,
      attachments,
    })
  }
}
