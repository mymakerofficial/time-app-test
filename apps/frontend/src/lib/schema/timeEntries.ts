import { z } from 'zod'

export const StreamingResponseRowType = {
  HEADER: 0,
  ROW: 1,
} as const
export type StreamingResponseRowType =
  (typeof StreamingResponseRowType)[keyof typeof StreamingResponseRowType]

export const TimeEntrySchema = z.object({
  id: z.nanoid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  syncStatus: z.enum(['synced', 'pending', 'error']),
  lookupKey: z.int().min(-1),
  startedAt: z.date(),
  endedAt: z.date().nullable(),
  message: z.string(),
})
export type TimeEntry = z.infer<typeof TimeEntrySchema>

export const StreamingResponseHeaderSchema = z.object({
  count: z.number().int().min(0),
})
export type StreamingResponseHeader = z.infer<
  typeof StreamingResponseHeaderSchema
>

export const GetTimeEntriesResponseSchema = z.discriminatedUnion('t', [
  z.object({
    t: z.literal(StreamingResponseRowType.HEADER),
    data: StreamingResponseHeaderSchema,
  }),
  z.object({
    t: z.literal(StreamingResponseRowType.ROW),
    data: z.any(),
  }),
])
export type GetTimeEntriesResponse = z.infer<
  typeof GetTimeEntriesResponseSchema
>

// parse string | null to int
export const GetTimeEntriesParamsSchema = z.object({
  start: z.string().transform((val) => (val ? parseInt(val, 10) : 0)),
  end: z.string().transform((val) => (val ? parseInt(val, 10) : 0)),
})
export type GetTimeEntriesParams = z.infer<typeof GetTimeEntriesParamsSchema>
