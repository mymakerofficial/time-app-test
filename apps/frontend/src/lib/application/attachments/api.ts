import { BaseApi } from '@/lib/application/base/baseApi.ts'
import { getResponseBody } from '@time-app-test/shared/fetch/response.ts'
import { UploadAttachmentBody } from '@time-app-test/shared/model/rest/attachments.ts'

export class AttachmentsApi extends BaseApi {
  async uploadFile(body: UploadAttachmentBody) {
    const response = await fetch('/api/attachments', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.session.getAccessToken()}`,
      },
    })
    await getResponseBody({
      response,
    })
  }

  async downloadFile(id: string) {
    const response = await fetch(`/api/attachments/${id}/content`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.session.getAccessToken()}`,
      },
    })
    return await response.bytes()
  }
}
