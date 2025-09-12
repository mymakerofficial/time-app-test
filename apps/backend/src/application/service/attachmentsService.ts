import { AttachmentsPersistencePort } from '@/application/port/attachmentsPersistencePort.ts'
import { Attachments } from '@time-app-test/shared/model/domain/attachments.ts'

export class AttachmentsService {
  readonly #attachmentsPersistence: AttachmentsPersistencePort

  constructor(container: {
    attachmentsPersistence: AttachmentsPersistencePort
  }) {
    this.#attachmentsPersistence = container.attachmentsPersistence
  }

  async create(file: Uint8Array, data: Attachments.EncryptedMetadataDto) {
    return this.#attachmentsPersistence.create(file, data)
  }

  async getAsFile(id: string) {
    return new Blob([await this.#attachmentsPersistence.getContentById(id)])
  }
}
