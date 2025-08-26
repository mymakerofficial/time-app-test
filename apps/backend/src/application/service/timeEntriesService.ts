import { TimeEntriesPersistencePort } from '@/application/port/timeEntriesPersistencePort.ts'
import { Range } from '@/domain/model/timeEntries.ts'

export class TimeEntriesService {
  readonly #timeEntriesPersistence: TimeEntriesPersistencePort

  constructor(container: {
    timeEntriesPersistence: TimeEntriesPersistencePort
  }) {
    this.#timeEntriesPersistence = container.timeEntriesPersistence
  }

  countRange(range: Range, userId: string) {
    return this.#timeEntriesPersistence.countRange(range, userId)
  }

  getAllInRange(range: Range, userId: string) {
    return this.#timeEntriesPersistence.getAllInRange(range, userId)
  }
}
