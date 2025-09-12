import { Attachments } from '@time-app-test/shared/model/domain/attachments.ts'

export interface AttachmentsPersistencePort {
  create(
    content: Uint8Array,
    data: Attachments.EncryptedMetadataDto,
  ): Promise<void>
  getContentById(id: string): Promise<Uint8Array>
}
