import { BaseService } from '@/lib/application/base/baseService.ts'
import { SessionContext } from '@/lib/application/session/sessionStore.ts'
import { AttachmentsApi } from '@/lib/application/attachments/api.ts'
import { str2ab, uint8ToHex } from '@time-app-test/shared/helper/binary.ts'
import { Crypt } from '@time-app-test/shared/helper/crypt.ts'
import { nanoid } from 'nanoid'
import { Attachments } from '@time-app-test/shared/model/domain/attachments.ts'

export class AttachmentsService extends BaseService {
  protected readonly attachmentsApi: AttachmentsApi

  constructor(container: {
    attachmentsApi: AttachmentsApi
    session: SessionContext
  }) {
    super(container)
    this.attachmentsApi = container.attachmentsApi
  }

  async uploadFile(file: File): Promise<Attachments.MetadataDto> {
    const id = nanoid()
    await this.attachmentsApi.uploadFile({
      // TODO dont encode to hex for file content
      file: uint8ToHex(
        await Crypt.encrypt(
          await file.arrayBuffer(),
          this.session.getEncryptionKey(),
        ),
      ),
      id,
      filename: uint8ToHex(
        await Crypt.encrypt(str2ab(file.name), this.session.getEncryptionKey()),
      ),
      mimeType: file.type,
    })
    return { id, filename: file.name, mimeType: file.type }
  }

  async downloadFile(attachment: Attachments.MetadataDto): Promise<File> {
    const buffer = await Crypt.decrypt(
      await this.attachmentsApi.downloadFile(attachment.id),
      this.session.getEncryptionKey(),
    )
    return new File([buffer], attachment.filename, {
      type: attachment.mimeType,
    })
  }
}
