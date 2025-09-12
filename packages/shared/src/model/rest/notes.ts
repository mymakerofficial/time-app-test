import {
  EncryptedNoteWithAttachmentIdsDtoSchema,
  EncryptedNoteWithAttachmentsMetaDtoSchema,
} from '@/model/domain/notes.ts'
import z from 'zod'

export const GetAllNotesResponseSchema =
  EncryptedNoteWithAttachmentsMetaDtoSchema.omit({
    userId: true,
  }).array()

export const CreateNoteBodySchema =
  EncryptedNoteWithAttachmentIdsDtoSchema.omit({
    userId: true,
  })
export type CreateNoteBody = z.Infer<typeof CreateNoteBodySchema>
