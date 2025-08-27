import z from 'zod'

export const RangeSchema = z.object({
  start: z.int(),
  end: z.int(),
})
export type Range = z.Infer<typeof RangeSchema>

export const EncryptedTimeEntrySchema = z.object({
  id: z.nanoid(),
  userId: z.nanoid(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lookupKey: z.int(),
  startedAt: z.string(),
  endedAt: z.string().nullable(),
  message: z.string(),
})
export type EncryptedTimeEntry = z.Infer<typeof EncryptedTimeEntrySchema>
