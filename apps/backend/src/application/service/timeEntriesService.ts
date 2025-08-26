import { TimeEntriesPersistencePort } from '@/application/port/timeEntriesPersistencePort.ts'
import { Range } from '@/domain/model/timeEntries.ts'

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

  getRangeStreaming(range: Range) {
    return this.#timeEntriesPersistence.getRangeStreaming(range)
  }
}
