import { createApiController } from '@/adapter/rest/utils/apiController.ts'
import z from 'zod'
import { UploadAttachmentBodySchema } from '@time-app-test/shared/model/rest/attachments.ts'
import { hexToUint8 } from '@time-app-test/shared/helper/binary.ts'
import { Attachments } from '@time-app-test/shared/model/domain/attachments.js'
import { status } from 'elysia'
import { HttpStatusCode } from '@time-app-test/shared/api/httpStatusCode.ts'

export const attachmentsController = createApiController({
  prefix: '/attachments',
  detail: { tags: ['Attachments'] },
})
  .post(
    '/',
    async ({ body: { file, ...meta }, session, attachmentsService }) => {
      const userId = session.getCurrentUserId()
      await attachmentsService.create(hexToUint8(file), { ...meta, userId })
      return status(HttpStatusCode.CREATED)
    },
    {
      body: UploadAttachmentBodySchema,
      validateSession: true,
    },
  )
  .get(
    '/:id/content',
    async ({ params, attachmentsService }) => {
      return await attachmentsService.getAsFile(params.id)
    },
    {
      response: z.file(),
      params: z.object({
        id: Attachments.IdSchema,
      }),
      // TODO ensure correct user
    },
  )
