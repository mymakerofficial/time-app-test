import { createCollection } from '@tanstack/react-db'
import { LocalNoteDtoSchema } from '@time-app-test/shared/model/domain/notes.ts'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { container } from '@/lib/application/container.ts'
import { queryClient } from '@/integrations/tanstack-query/root-provider.tsx'

export const notesCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['users', container.session.getUserIdSafe(), 'notes'],
    queryFn: async () => {
      return await container.notesService.getNotes()
    },
    onInsert: async ({ transaction }) => {
      await container.notesService.createNoteOnServer(
        transaction.mutations[0].modified,
      )
    },
    getKey: (note) => note.id,
    schema: LocalNoteDtoSchema,
    queryClient,
  }),
)
