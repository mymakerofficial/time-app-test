import { BaseApi } from '@/lib/application/base/baseApi.ts'
import { getResponseBody } from '@time-app-test/shared/fetch/response.ts'
import {
  CreateNoteBody,
  CreateNoteBodySchema,
  GetAllNotesResponseSchema,
} from '@time-app-test/shared/model/rest/notes.ts'

export class NotesApi extends BaseApi {
  async getNotes() {
    const response = await fetch('/api/notes', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.session.getAccessToken()}`,
      },
    })
    return await getResponseBody({
      response,
      schema: GetAllNotesResponseSchema,
    })
  }

  async createNote(note: CreateNoteBody) {
    const response = await fetch('/api/notes', {
      method: 'PUT',
      body: JSON.stringify(CreateNoteBodySchema.encode(note)),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.session.getAccessToken()}`,
      },
    })
    await getResponseBody({
      response,
    })
  }
}
