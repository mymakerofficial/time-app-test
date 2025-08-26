import { EncryptedTimeEntry, Range } from '@/domain/model/timeEntries.ts'

export interface TimeEntriesPersistencePort {
  countRange(range: Range, userId: string): Promise<number>
  getAllInRange(range: Range, userId: string): Promise<EncryptedTimeEntry[]>
}
