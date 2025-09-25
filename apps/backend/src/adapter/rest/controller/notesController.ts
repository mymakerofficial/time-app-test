import { createApiController } from '@/adapter/rest/utils/apiController.ts'
import {
  CreateNoteBodySchema,
  GetAllNotesResponseSchema,
} from '@time-app-test/shared/model/rest/notes.ts'
import { Config } from '@time-app-test/shared/model/domain/config.ts'

export function notesController(config: Config.ApplicationConfig) {
  return createApiController(config, {
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
        transacting: true,
      },
    )
}
