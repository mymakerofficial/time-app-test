import { NotesPersistencePort } from '@/application/port/notesPersistencePort.ts'
import { EncryptedNoteWithAttachmentIdsDto } from '@time-app-test/shared/model/domain/notes.ts'

export class NotesService {
  readonly #notesPersistence: NotesPersistencePort

  constructor(container: { notesPersistence: NotesPersistencePort }) {
    this.#notesPersistence = container.notesPersistence
  }

  async getAll(userId: string) {
    return await this.#notesPersistence.getAll(userId)
  }

  async createNote({
    attachments,
    ...note
  }: EncryptedNoteWithAttachmentIdsDto) {
    await this.#notesPersistence.createNote(note)
    for (const attachmentId of attachments) {
      await this.#notesPersistence.addAttachmentToNote(note.id, attachmentId)
    }
  }
}
