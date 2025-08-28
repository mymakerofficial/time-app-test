import { notes } from '@/adapter/db/schema/schema.ts'
import { and, eq } from 'drizzle-orm'
import { DB } from '@/config/services.ts'
import { NotesPersistencePort } from '@/application/port/notesPersistencePort.ts'
import { EncryptedNote } from '@time-app-test/shared/model/domain/notes.ts'

export class NotesPersistence implements NotesPersistencePort {
  readonly #db: DB

  constructor(container: { db: DB }) {
    this.#db = container.db
  }

  async getAll(userId: string) {
    return await this.#db
      .select({
        id: notes.id,
        userId: notes.userId,
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
        message: notes.message,
      })
      .from(notes)
      .where(and(eq(notes.userId, userId)))
  }

  async createNote(note: EncryptedNote) {
    await this.#db.insert(notes).values(note)
  }
}
