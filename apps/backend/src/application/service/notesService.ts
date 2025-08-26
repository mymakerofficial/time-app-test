import { NotesPersistencePort } from '@/application/port/notesPersistencePort.ts'

export class NotesService {
  readonly #notesPersistence: NotesPersistencePort

  constructor(container: { notesPersistence: NotesPersistencePort }) {
    this.#notesPersistence = container.notesPersistence
  }

  getAll(userId: string) {
    return this.#notesPersistence.getAll(userId)
  }
}
