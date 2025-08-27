import z from 'zod'
import { nanoid } from 'nanoid'

export const NoteIdSchema = z.nanoid().meta({
  examples: Array.from({ length: 4 }, () => nanoid()),
})

export const EncryptedNoteSchema = z.object({
  id: NoteIdSchema,
  createdAt: z.hex(),
  updatedAt: z.hex(),
  message: z.hex(),
})
export type EncryptedNote = z.Infer<typeof EncryptedNoteSchema>

export const NoteSchema = z.object({
  id: NoteIdSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  message: z.string(),
})
export type Note = z.Infer<typeof NoteSchema>
