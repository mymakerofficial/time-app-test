import { EncryptedNoteDto } from '@time-app-test/shared/model/domain/notes.ts'

export interface NotesPersistencePort {
  getAll(userId: string): Promise<EncryptedNoteDto[]>
  createNote(note: EncryptedNoteDto): Promise<void>
}
