import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { swagger } from '@elysiajs/swagger'
import { apiController } from '@/domain/api.ts'

export const app = new Elysia({ adapter: node() })
  .use(swagger())
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
