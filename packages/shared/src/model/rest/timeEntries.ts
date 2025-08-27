import { EncryptedTimeEntrySchema } from '@/model/domain/timeEntries.ts'

export const GetTimeEntriesInRangeResponseSchema =
  EncryptedTimeEntrySchema.array()
