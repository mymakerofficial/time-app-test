import { Elysia } from 'elysia'
import { servicesPlugin } from '@/config/services.ts'
import z from 'zod'
import { Session } from '@/adapter/rest/utils/session.ts'

export const sessionPlugin = new Elysia({ name: 'session' })
  .use(servicesPlugin)
  .resolve({ as: 'scoped' }, (context) => ({
    session: new Session(context),
  }))
  .macro({
    authorizationHeader: {
      headers: z.object({
        authorization: z.string().regex(/^Bearer .+$/),
      }),
      // schema defined in a macro doesnt appear in openapi
      detail: {
        parameters: [
          {
            schema: {
              type: 'string',
              pattern: '^Bearer .+$',
            },
            in: 'header',
            name: 'authorization',
          },
        ],
      },
    },
    validateSession: {
      authorizationHeader: true,
      resolve: async ({ session }) => {
        if (!session) {
          return
        }
        const validatedSession = await session.validateSession()
        return {
          session: validatedSession,
        }
      },
    },
  })
