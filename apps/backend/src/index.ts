import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { apiController } from '@/adapter/rest/api.ts'
import openapi from '@elysiajs/openapi'

export const app = new Elysia({ adapter: node() })
  .use(openapi())
  .use(apiController)
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
