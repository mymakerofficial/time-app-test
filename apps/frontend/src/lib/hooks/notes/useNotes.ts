import { useAccessToken, useEncryptionKey } from '@/lib/authStore.ts'
import { useQuery } from '@tanstack/react-query'
import { getResponseBody } from '@time-app-test/shared/fetch/response.ts'
import { useLiveQuery } from '@tanstack/react-db'
import { notesCollection } from '@/lib/collections'
import { GetAllNotesResponseSchema } from '@time-app-test/shared/model/rest/notes.ts'
import { ab2str, hexToUint8 } from '@time-app-test/shared/helper/binary.ts'
import { Crypt } from '@/lib/utils/crypt.ts'
import { SyncStatus } from '@time-app-test/shared/model/domain/notes.ts'

export function useNotes() {
  const getAccessToken = useAccessToken()
  const getEncryptionKey = useEncryptionKey()

  useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const response = await fetch('/api/notes', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
      })

      const encodedData = await getResponseBody({
        response,
        schema: GetAllNotesResponseSchema,
      })

      const key = getEncryptionKey()
      async function decode<T = string>(
        input: string,
        transform: (input: string) => T = (v) => v as T,
      ) {
        return transform(ab2str(await Crypt.decrypt(hexToUint8(input), key)))
      }

      const data = await Promise.all(
        encodedData.map(async (it) => ({
          id: it.id,
          createdAt: await decode(it.createdAt, (value) => new Date(value)),
          updatedAt: await decode(it.updatedAt, (value) => new Date(value)),
          syncStatus: SyncStatus.Synced,
          message: await decode(it.message),
        })),
      )

      const existingIds = new Set(notesCollection.keys())
      notesCollection.insert(data.filter((it) => !existingIds.has(it.id)))
    },
  })

  return useLiveQuery((q) =>
    q
      .from({ notes: notesCollection })
      .orderBy(({ notes }) => notes.createdAt, 'desc'),
  )
}
