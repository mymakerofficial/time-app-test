import QueryStream from 'pg-query-stream'
import { Range } from '@/domain/model/timeEntries.ts'

export interface TimeEntriesPersistencePort {
  countRange(range: Range): Promise<number>
  // TODO dont use QueryStream
  getRange(range: Range): QueryStream
}
