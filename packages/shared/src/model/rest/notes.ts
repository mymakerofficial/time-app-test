import { EncryptedNoteSchema } from '@/model/domain/notes.ts'

export const GetAllNotesResponseSchema = EncryptedNoteSchema.array()
