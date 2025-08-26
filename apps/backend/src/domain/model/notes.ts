import z from 'zod'

export const EncryptedNoteSchema = z.object({
  id: z.nanoid(),
  userId: z.nanoid(),
  createdAt: z.string(),
  updatedAt: z.string(),
  message: z.string(),
})
export type EncryptedNote = z.Infer<typeof EncryptedNoteSchema>
