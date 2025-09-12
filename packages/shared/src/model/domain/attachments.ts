import z from 'zod'
import { nanoid } from 'nanoid'
import { MimeTypeSchema } from '@/model/domain/mimeType.ts'
import { UserIdSchema } from '@/model/domain/user.ts'
import { uInt8Array } from '@/zod.ts'

export namespace Attachments {
  export const IdSchema = z.nanoid().meta({
    description: 'Unique identifier for an attachment',
    examples: Array.from({ length: 4 }, () => nanoid()),
  })

  export const EncryptedMetadataDtoSchema = z.object({
    id: IdSchema,
    userId: UserIdSchema,
    filename: z.hex(),
    mimeType: MimeTypeSchema,
  })
  export type EncryptedMetadataDto = z.infer<typeof EncryptedMetadataDtoSchema>

  export const MetadataDtoSchema = z.object({
    id: IdSchema,
    filename: z.string().min(1),
    mimeType: MimeTypeSchema,
  })
  export type MetadataDto = z.infer<typeof MetadataDtoSchema>
}
