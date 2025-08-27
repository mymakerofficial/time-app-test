import {
  EncryptedTimeEntry,
  Range,
} from '@time-app-test/shared/model/domain/timeEntries.ts'

export interface TimeEntriesPersistencePort {
  countRange(range: Range, userId: string): Promise<number>
  getAllInRange(range: Range, userId: string): Promise<EncryptedTimeEntry[]>
}
