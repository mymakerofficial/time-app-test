import { EncryptedNote } from '@time-app-test/shared/model/domain/notes.ts'

export interface NotesPersistencePort {
  getAll(userId: string): Promise<EncryptedNote[]>
  createNote(note: EncryptedNote): Promise<void>
}
