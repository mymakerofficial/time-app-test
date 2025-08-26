import { TimeEntriesPersistencePort } from '@/application/port/timeEntriesPersistencePort.ts'
import { timeEntries } from '@/adapter/db/schema/schema.ts'
import { and, gt, lt } from 'drizzle-orm'
import { DB } from '@/config/services.ts'
import { Range } from '@/domain/model/timeEntries.ts'

export class TimeEntriesPersistence implements TimeEntriesPersistencePort {
  readonly #db: DB

  constructor(container: { db: DB }) {
    this.#db = container.db
  }

  #getRangeQuery({ start, end }: Range) {
    return this.#db
      .select()
      .from(timeEntries)
      .where(
        and(gt(timeEntries.lookupKey, start), lt(timeEntries.lookupKey, end)),
      )
  }

  async countRange(range: Range) {
    return await this.#db.$count(this.#getRangeQuery(range))
  }

  getRangeStreaming(range: Range) {
    return this.#db.queryStream(this.#getRangeQuery(range))
  }
}
