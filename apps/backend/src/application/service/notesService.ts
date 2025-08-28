import { NotesPersistencePort } from '@/application/port/notesPersistencePort.ts'
import { EncryptedNote } from '@time-app-test/shared/model/domain/notes.ts'

export class NotesService {
  readonly #notesPersistence: NotesPersistencePort

  constructor(container: { notesPersistence: NotesPersistencePort }) {
    this.#notesPersistence = container.notesPersistence
  }

  getAll(userId: string) {
    return this.#notesPersistence.getAll(userId)
  }

  createNote(note: EncryptedNote) {
    return this.#notesPersistence.createNote(note)
  }
}
