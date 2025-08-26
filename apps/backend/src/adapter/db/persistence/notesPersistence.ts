import { notes, timeEntries } from '@/adapter/db/schema/schema.ts'
import { and, eq } from 'drizzle-orm'
import { DB } from '@/config/services.ts'
import { NotesPersistencePort } from '@/application/port/notesPersistencePort.ts'

export class NotesPersistence implements NotesPersistencePort {
  readonly #db: DB

  constructor(container: { db: DB }) {
    this.#db = container.db
  }

  async getAll(userId: string) {
    return await this.#db
      .select()
      .from(notes)
      .where(and(eq(timeEntries.userId, userId)))
  }
}
