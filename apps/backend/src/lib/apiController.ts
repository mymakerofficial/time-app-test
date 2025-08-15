import type { ElysiaConfig } from 'elysia/types'
import { Elysia, t } from 'elysia'
import { services } from '@/services.ts'
import { session } from '@/domain/session/session.ts'

export function createApiController<BasePath extends string = ''>(
  config: ElysiaConfig<BasePath>,
) {
  return new Elysia(config)
    .guard({
      headers: t.Object({
        authorization: t.Optional(t.TemplateLiteral('Bearer ${string}')),
      }),
      cookie: t.Cookie({
        refreshToken: t.Optional(t.String()),
      }),
    })
    .use(services)
    .use(session)
    .macro({
      validateSession: (enabled: true) => ({
        resolve: async ({ session }) => {
          if (!enabled || !session) {
            return
          }
          return { session: await session.validateSession() }
        },
      }),
    })
}
