import { nanoid } from 'nanoid'
import { Note, SyncStatus } from '@time-app-test/shared/model/domain/notes.ts'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/lib/application/session/sessionStore.ts'
import { CreateNoteBodySchema } from '@time-app-test/shared/model/rest/notes.ts'
import { str2ab, uint8ToHex } from '@time-app-test/shared/helper/binary.ts'
import { Crypt } from '@time-app-test/shared/helper/crypt.ts'
import { getResponseBody } from '@time-app-test/shared/fetch/response.ts'

export function useCreateNote() {
  const { getUserId, getAccessToken, getEncryptionKey } = useSession()
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: async (note: Note) => {
      const key = getEncryptionKey()
      async function encode(input: string) {
        return uint8ToHex(await Crypt.encrypt(str2ab(input), key))
      }

      const response = await fetch('/api/notes', {
        method: 'PUT',
        body: JSON.stringify(
          CreateNoteBodySchema.encode({
            id: note.id,
            createdAt: await encode(note.createdAt.toISOString()),
            updatedAt: await encode(note.updatedAt.toISOString()),
            message: await encode(note.message),
          }),
        ),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
      })

      await getResponseBody({
        response,
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['user', getUserId(), 'notes'],
      })
    },
  })

  return ({ message }: { message: string }) => {
    mutate({
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: SyncStatus.Pending,
      deleted: false,
      message,
    })
  }
}
