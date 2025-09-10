import { NotesPersistencePort } from '@/application/port/notesPersistencePort.ts'
import { EncryptedNoteDto } from '@time-app-test/shared/model/domain/notes.ts'

export class NotesService {
  readonly #notesPersistence: NotesPersistencePort

  constructor(container: { notesPersistence: NotesPersistencePort }) {
    this.#notesPersistence = container.notesPersistence
  }

  getAll(userId: string) {
    return this.#notesPersistence.getAll(userId)
  }

  createNote(note: EncryptedNoteDto) {
    return this.#notesPersistence.createNote(note)
  }
}
