import { TimeEntriesPersistencePort } from '@/application/port/timeEntriesPersistencePort.ts'
import { Range } from '@/domain/model/timeEntries.ts'
import { createEncodedStream } from '@/lib/streams.ts'

export class TimeEntriesService {
  readonly #timeEntriesPersistence: TimeEntriesPersistencePort

  constructor(container: {
    timeEntriesPersistence: TimeEntriesPersistencePort
  }) {
    this.#timeEntriesPersistence = container.timeEntriesPersistence
  }

  async countRange(range: Range) {
    return this.#timeEntriesPersistence.countRange(range)
  }

  getRange(range: Range) {
    return this.#timeEntriesPersistence.getRange(range)
  }

  // TODO eh
  getRangeStream(range: Range) {
    return createEncodedStream({
      handler: async (controller) => {
        const count = await this.countRange(range)

        controller.enqueue({
          t: 0,
          data: { count },
        })

        const queryStream = this.getRange(range)

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
