import {
  attachments,
  noteAttachments,
  notes,
} from '@/adapter/db/schema/schema.ts'
import { eq, getTableColumns } from 'drizzle-orm'
import { DB } from '@/config/services.ts'
import { NotesPersistencePort } from '@/application/port/notesPersistencePort.ts'
import {
  EncryptedNoteDto,
  EncryptedNoteWithAttachmentsMetaDto,
} from '@time-app-test/shared/model/domain/notes.ts'
import { jsonAgg } from '@/lib/drizzleJsonAgg'

export class NotesPersistence implements NotesPersistencePort {
  readonly #db: DB

  constructor(container: { db: DB }) {
    this.#db = container.db
  }

  async getAll(userId: string): Promise<EncryptedNoteWithAttachmentsMetaDto[]> {
    return this.#db
      .select({
        ...getTableColumns(notes),
        attachments: jsonAgg({
          id: attachments.id,
          userId: attachments.userId,
          filename: attachments.filename,
          mimeType: attachments.mimeType,
        }),
      })
      .from(notes)
      .where(eq(notes.userId, userId))
      .leftJoin(noteAttachments, eq(noteAttachments.noteId, notes.id))
      .leftJoin(attachments, eq(noteAttachments.attachmentId, attachments.id))
      .groupBy(notes.id)
  }

  async createNote(note: EncryptedNoteDto) {
    await this.#db.insert(notes).values(note)
  }

  async addAttachmentToNote(noteId: string, attachmentId: string) {
    await this.#db
      .insert(noteAttachments)
      .values({ noteId, attachmentId })
      .onConflictDoNothing()
  }
}
