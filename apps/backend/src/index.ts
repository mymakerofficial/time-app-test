import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { swagger } from '@elysiajs/swagger'
import { apiController } from '@/modules/api.ts'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '@/db/schema/schema.ts'

export const pool = new Pool({
  connectionString:
    'postgres://postgres_user:password@localhost:5432/postgres_db',
})
export const client = await pool.connect()
export const db = drizzle({ client, schema })

export const app = new Elysia({ adapter: node() })
  .use(swagger())
  .use(apiController)
  .listen(3000, ({ hostname, port }) => {
    console.log(`🦊 Elysia is running at ${hostname}:${port}`)
  })

if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    console.log('♻️  Disposing old server instance...')
    void app.stop()
  })
}
