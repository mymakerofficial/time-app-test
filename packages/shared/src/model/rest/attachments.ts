import { Attachments } from '@/model/domain/attachments.ts'
import z from 'zod'

export const UploadAttachmentBodySchema =
  Attachments.EncryptedMetadataDtoSchema.omit({
    userId: true,
  }).extend({
    file: z.hex().meta({
      description: 'The file to be uploaded',
    }),
  })
export type UploadAttachmentBody = z.infer<typeof UploadAttachmentBodySchema>
