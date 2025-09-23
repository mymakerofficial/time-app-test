import { createApiController } from '@/adapter/rest/utils/apiController.ts'
import {
  CreateNoteBodySchema,
  GetAllNotesResponseSchema,
} from '@time-app-test/shared/model/rest/notes.ts'

export const notesController = createApiController({
  prefix: '/notes',
  detail: { tags: ['Notes'] },
})
  .get(
    '/',
    async ({ session, notesService }) => {
      const userId = session.getCurrentUserId()
      return await notesService.getAll(userId)
    },
    {
      response: GetAllNotesResponseSchema,
      validateSession: true,
    },
  )
  .put(
    '/',
    async ({ body, session, notesService }) => {
      const userId = session.getCurrentUserId()
      await notesService.createNote({
        userId,
        ...body,
      })
    },
    {
      body: CreateNoteBodySchema,
      validateSession: true,
    },
  )
