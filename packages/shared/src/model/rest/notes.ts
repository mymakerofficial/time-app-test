import { EncryptedNoteDtoSchema } from '@/model/domain/notes.ts'
import z from 'zod'

export const GetAllNotesResponseSchema = EncryptedNoteDtoSchema.omit({
  userId: true,
}).array()

export const CreateNoteBodySchema = EncryptedNoteDtoSchema.omit({
  userId: true,
})
export type CreateNoteBody = z.Infer<typeof CreateNoteBodySchema>
