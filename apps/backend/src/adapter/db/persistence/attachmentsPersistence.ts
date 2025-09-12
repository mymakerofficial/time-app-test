import { attachments } from '@/adapter/db/schema/schema.ts'
import { DB } from '@/config/services.ts'
import { AttachmentsPersistencePort } from '@/application/port/attachmentsPersistencePort.ts'
import { Attachments } from '@time-app-test/shared/model/domain/attachments.ts'
import { eq } from 'drizzle-orm'
import { AttachmentNotFoundById } from '@time-app-test/shared/error/errors.ts'

export class AttachmentsPersistence implements AttachmentsPersistencePort {
  readonly #db: DB

  constructor(container: { db: DB }) {
    this.#db = container.db
  }

  async create(content: Uint8Array, data: Attachments.EncryptedMetadataDto) {
    await this.#db.insert(attachments).values({
      ...data,
      content,
    })
  }

  async getContentById(id: string): Promise<Uint8Array> {
    const [attachment] = await this.#db
      .select({
        content: attachments.content,
      })
      .from(attachments)
      .where(eq(attachments.id, id))
      .limit(1)

    if (!attachment) {
      throw AttachmentNotFoundById({ id })
    }

    return attachment.content
  }
}
