import { Range } from '@/domain/model/timeEntries.ts'
import { Readable } from 'node:stream'

export interface TimeEntriesPersistencePort {
  countRange(range: Range): Promise<number>
  getRangeStreaming(range: Range): Readable
}
