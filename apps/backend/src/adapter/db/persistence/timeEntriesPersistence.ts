import { TimeEntriesPersistencePort } from '@/application/port/timeEntriesPersistencePort.ts'
import { timeEntries } from '@/adapter/db/schema/schema.ts'
import { and, eq, gt, lt } from 'drizzle-orm'
import { DB } from '@/config/services.ts'
import { Range } from '@/domain/model/timeEntries.ts'

export class TimeEntriesPersistence implements TimeEntriesPersistencePort {
  readonly #db: DB

  constructor(container: { db: DB }) {
    this.#db = container.db
  }

  #getRangeQuery({ start, end }: Range, userId: string) {
    return this.#db
      .select({
        id: timeEntries.id,
        userId: timeEntries.userId,
        createdAt: timeEntries.createdAt,
        updatedAt: timeEntries.updatedAt,
        lookupKey: timeEntries.lookupKey,
        startedAt: timeEntries.startedAt,
        endedAt: timeEntries.endedAt,
        message: timeEntries.message,
      })
      .from(timeEntries)
      .where(
        and(
          gt(timeEntries.lookupKey, start),
          lt(timeEntries.lookupKey, end),
          eq(timeEntries.userId, userId),
        ),
      )
  }

  async countRange(range: Range, userId: string) {
    return await this.#db.$count(this.#getRangeQuery(range, userId))
  }

  async getAllInRange(range: Range, userId: string) {
    return await this.#getRangeQuery(range, userId)
  }
}
