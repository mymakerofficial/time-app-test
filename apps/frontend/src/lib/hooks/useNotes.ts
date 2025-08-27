import { useAccessToken } from '@/lib/authStore.ts'
import { useQuery } from '@tanstack/react-query'
import { getResponseBody } from '@time-app-test/shared/fetch/response.ts'
import { useLiveQuery } from '@tanstack/react-db'
import { notesCollection } from '@/lib/collections'
import { GetAllNotesResponseSchema } from '@time-app-test/shared/model/rest/notes.ts'

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
        schema: GetAllNotesResponseSchema,
      })
      // TODO decrypt
      notesCollection.insert(data)
    },
  })

  return useLiveQuery(notesCollection)
}
