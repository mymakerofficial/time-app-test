import z from 'zod'
import { uInt8Array } from '@time-app-test/shared/zod.ts'

export const RangeSchema = z.object({
  start: z.int(),
  end: z.int(),
})
export type Range = z.Infer<typeof RangeSchema>

export const EncryptedTimeEntrySchema = z.object({
  id: z.nanoid(),
  createdAt: uInt8Array(),
  updatedAt: uInt8Array(),
  lookupKey: z.int(),
  startedAt: uInt8Array(),
  endedAt: uInt8Array(),
  message: uInt8Array(),
})
export type EncryptedTimeEntry = z.Infer<typeof EncryptedTimeEntrySchema>
