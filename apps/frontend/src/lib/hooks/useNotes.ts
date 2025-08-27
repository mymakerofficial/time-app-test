import { useAccessToken } from '@/lib/authStore.ts'
import { useQuery } from '@tanstack/react-query'
import { getResponseBody } from '@time-app-test/shared/fetch/response.ts'
import { EncryptedNoteSchema } from '@time-app-test/shared/domain/model/notes.ts'
import { useLiveQuery } from '@tanstack/react-db'
import { notesCollection } from '@/lib/collections'

export function useNotes() {
  const getAccessToken = useAccessToken()

  useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const response = await fetch('/api/notes', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
      })
      const data = await getResponseBody({
        response,
        schema: EncryptedNoteSchema.array(),
      })
      // TODO decrypt
      notesCollection.insert(data)
    },
  })

  return useLiveQuery(notesCollection)
}
