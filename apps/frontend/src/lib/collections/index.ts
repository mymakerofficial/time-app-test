import {
  createCollection,
  localOnlyCollectionOptions,
} from '@tanstack/react-db'
import { NoteSchema } from '@time-app-test/shared/model/domain/notes.ts'

export const notesCollection = createCollection(
  localOnlyCollectionOptions({
    id: 'notes',
    getKey: (note) => note.id,
    schema: NoteSchema,
  }),
)
