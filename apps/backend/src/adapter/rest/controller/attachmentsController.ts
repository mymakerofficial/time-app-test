import { createApiController } from '@/adapter/rest/utils/apiController.ts'
import { createLocalHook } from '@/adapter/rest/utils/zodAdapter.ts'
import z from 'zod'
import { UploadAttachmentBodySchema } from '@time-app-test/shared/model/rest/attachments.ts'
import { hexToUint8 } from '@time-app-test/shared/helper/binary.ts'

export const attachmentsController = createApiController({
  prefix: '/attachments',
  detail: { tags: ['Attachments'] },
})
  .post(
    '/',
    async ({ body: { file, ...meta }, session, attachmentsService }) => {
      const userId = session.getCurrentUserId()
      await attachmentsService.create(hexToUint8(file), { ...meta, userId })
    },
    createLocalHook({
      body: UploadAttachmentBodySchema,
      validateSession: true,
    }),
  )
  .get(
    '/:id/content',
    async ({ params, attachmentsService }) => {
      return await attachmentsService.getAsFile(params.id)
    },
    createLocalHook({
      response: z.file(),
      // TODO ensure correct user
      validateSession: false,
    }),
  )
