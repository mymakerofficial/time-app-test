import z from 'zod'

export const EncryptedNoteSchema = z.object({
  id: z.nanoid(),
  createdAt: z.string(),
  updatedAt: z.string(),
  message: z.string(),
})
export type EncryptedNote = z.Infer<typeof EncryptedNoteSchema>

export const NoteSchema = z.object({
  id: z.nanoid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  message: z.string(),
})
export type Note = z.Infer<typeof NoteSchema>
