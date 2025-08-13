import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'

export const app = new Elysia({ adapter: node() })
  .get('/', () => 'Hello Elysia')
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${hostname}:${port}`)
  })

if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    console.log('♻️  Disposing old server instance...')
    app.stop()
  })
}
