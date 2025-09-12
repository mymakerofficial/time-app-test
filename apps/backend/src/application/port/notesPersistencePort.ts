import {
  EncryptedNoteDto,
  EncryptedNoteWithAttachmentsMetaDto,
} from '@time-app-test/shared/model/domain/notes.ts'

export interface NotesPersistencePort {
  getAll(userId: string): Promise<EncryptedNoteWithAttachmentsMetaDto[]>
  createNote(note: EncryptedNoteDto): Promise<void>
  addAttachmentToNote(noteId: string, attachmentId: string): Promise<void>
}
