import { createApiController } from '@/adapter/rest/utils/apiController.ts'
import { createLocalHook } from '@/adapter/rest/utils/zodAdapter.ts'
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
      return GetAllNotesResponseSchema.encode(await notesService.getAll(userId))
    },
    createLocalHook({
      response: GetAllNotesResponseSchema,
      validateSession: true,
    }),
  )
  .put(
    '/',
    async ({ session, notesService }) => {
      const userId = session.getCurrentUserId()
      const body = await session.getBody(CreateNoteBodySchema)
      return await notesService.createNote({
        userId,
        ...body,
      })
    },
    createLocalHook({
      body: CreateNoteBodySchema,
      validateSession: true,
    }),
  )
