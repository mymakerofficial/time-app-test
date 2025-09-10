import z from 'zod'
import { nanoid } from 'nanoid'
import { UserIdSchema } from '@/model/domain/user.ts'

export const SyncStatus = {
  Pending: 'pending',
  Synced: 'synced',
} as const
export type SyncStatus = (typeof SyncStatus)[keyof typeof SyncStatus]

export const NoteIdSchema = z.nanoid().meta({
  examples: Array.from({ length: 4 }, () => nanoid()),
})
export const NoteMessageSchema = z.string().min(1)
export const EntitySyncStatusSchema = z.enum(SyncStatus)

export const AttachmentIdSchema = z.nanoid().meta({
  description: 'Unique identifier for an attachment',
  examples: Array.from({ length: 4 }, () => nanoid()),
})

export const EncryptedAttachmentMetadataDtoSchema = z.object({
  id: AttachmentIdSchema,
  filename: z.hex(),
  mimeType: z.string(),
})

export const AttachmentMetadataDtoSchema = z.object({
  id: AttachmentIdSchema,
  filename: z.string().min(1),
  mimeType: z.string(),
})

export const EncryptedNoteDtoSchema = z.object({
  id: NoteIdSchema,
  userId: UserIdSchema,
  createdAt: z.hex(),
  updatedAt: z.hex(),
  message: z.hex(),
})
export type EncryptedNoteDto = z.Infer<typeof EncryptedNoteDtoSchema>

export const EncryptedNoteWithAttachmentsMetaDtoSchema =
  EncryptedNoteDtoSchema.extend({
    attachments: EncryptedAttachmentMetadataDtoSchema.array(),
  })
export type EncryptedNoteWithAttachmentsMetaDto = z.Infer<
  typeof EncryptedNoteWithAttachmentsMetaDtoSchema
>

export const LocalNoteDtoSchema = z.object({
  id: NoteIdSchema,
  userId: UserIdSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  syncStatus: EntitySyncStatusSchema,
  deleted: z.boolean().default(false),
  message: NoteMessageSchema,
  attachments: AttachmentMetadataDtoSchema.array(),
})
export type LocalNoteDto = z.Infer<typeof LocalNoteDtoSchema>
