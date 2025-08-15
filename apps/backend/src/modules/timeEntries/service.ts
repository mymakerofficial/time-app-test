import { DB } from '@/services.ts'
import { TimeEntriesModel } from '@/modules/timeEntries/model.ts'
import { createEncodedStream } from '@/lib/streams.ts'
import { timeEntries } from '@/db/schema/schema'
import { and, gt, lt } from 'drizzle-orm'

export class TimeEntriesService {
  readonly #db: DB

  constructor(container: { db: DB }) {
    this.#db = container.db
  }

  getRange({ start, end }: TimeEntriesModel.RangeQuery) {
    return createEncodedStream({
      handler: async (controller) => {
        const query = this.#db
          .select()
          .from(timeEntries)
          .where(
            and(
              gt(timeEntries.lookupKey, start),
              lt(timeEntries.lookupKey, end),
            ),
          )

        const count = await this.#db.$count(query)

        controller.enqueue({
          t: 0,
          data: {
            count,
          },
        })

        const queryStream = this.#db.queryStream(query)

        queryStream.on('data', (row) => {
          controller.enqueue({
            t: 1,
            data: row,
          })
        })

        queryStream.on('end', () => {
          controller.close()
        })
      },
    })
  }
}
