import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { apiController } from '@/adapter/rest/api.ts'
import openapi from '@elysiajs/openapi'
import { toSchema } from '@/adapter/rest/utils/zodAdapter.ts'
import { isPlainObject } from '@time-app-test/shared/guards.ts'
import { Config } from '@time-app-test/shared/model/domain/config.ts'

export const app = new Elysia({ adapter: node() })
  .use(
    openapi({
      mapJsonSchema: {
        zod: toSchema,
      },
    }),
  )
  .onBeforeHandle(({ path, body }) => {
    console.log(`[REQUEST] ${path} ${JSON.stringify(body)}`)
  })
  .onAfterHandle(({ path, responseValue }) => {
    console.log(
      `[RESPONSE] ${path} ${isPlainObject(responseValue) ? JSON.stringify(responseValue) : responseValue}`,
    )
  })
  .use(
    apiController(
      new Config.ApplicationConfig({
        pgConnectionString:
          'postgres://postgres_user:password@localhost:5432/postgres_db',
        redisConnectionString: 'redis://localhost:6379',
      }),
    ),
  )
  .listen(3001, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${hostname}:${port}`)
  })

if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    console.log('♻️  Disposing old server instance...')
    void app.stop()
  })
}
