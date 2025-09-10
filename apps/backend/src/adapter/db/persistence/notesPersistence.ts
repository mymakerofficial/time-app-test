import { attachments, notes } from '@/adapter/db/schema/schema.ts'
import { eq, getTableColumns, sql } from 'drizzle-orm'
import { DB } from '@/config/services.ts'
import { NotesPersistencePort } from '@/application/port/notesPersistencePort.ts'
import {
  EncryptedAttachmentMetadataDtoSchema,
  EncryptedNoteDto,
  EncryptedNoteWithAttachmentsMetaDto,
} from '@time-app-test/shared/model/domain/notes.ts'
import { isArray, isObject } from '@time-app-test/shared/guards.js'
import z from 'zod'

function arraySchema<T extends z.ZodObject>(itemSchema: T) {
  return {
    mapFromDriverValue: (value: unknown) => {
      if (!isArray(value)) return []
      return value
        .filter(
          (item) =>
            isObject(item) && Object.values(item).some((v) => v !== null),
        )
        .map((item) => itemSchema.parse(item))
    },
  }
}

export class NotesPersistence implements NotesPersistencePort {
  readonly #db: DB

  constructor(container: { db: DB }) {
    this.#db = container.db
  }

  async getAll(userId: string): Promise<EncryptedNoteWithAttachmentsMetaDto[]> {
    return this.#db
      .select({
        ...getTableColumns(notes),
        attachments: sql`json_agg(json_build_object(
          'id', ${attachments.id}, 
          'filename', ${attachments.filename},
          'mimeType', ${attachments.mimeType}
        ))`.mapWith(arraySchema(EncryptedAttachmentMetadataDtoSchema)),
      })
      .from(notes)
      .where(eq(notes.userId, userId))
      .leftJoin(attachments, eq(attachments.noteId, notes.id))
      .groupBy(notes.id)
  }

  async createNote(note: EncryptedNoteDto) {
    await this.#db.insert(notes).values(note)
  }
}
