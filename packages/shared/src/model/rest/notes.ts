import { EncryptedNoteSchema } from '@/model/domain/notes.ts'

export const GetAllNotesResponseSchema = EncryptedNoteSchema.omit({
  userId: true,
}).array()

export const CreateNoteBodySchema = EncryptedNoteSchema.omit({
  userId: true,
})
