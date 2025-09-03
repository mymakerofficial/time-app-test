import { AuthService } from '@/application/service/authService.ts'
import { Elysia } from 'elysia'
import { Container } from '@/lib/container.ts'
import { Pool } from 'pg'
import { drizzle } from '@/lib/drizzle.ts'
import * as schema from '@/adapter/db/schema/schema.ts'
import { TimeEntriesService } from '@/application/service/timeEntriesService.ts'
import { TokenService } from '@/application/service/tokenService.ts'
import { createClient } from 'redis'
import { RedisAuthCache } from '@/adapter/redis/auth/authCache.ts'
import { UserPersistence } from '@/adapter/db/persistence/userPersistence.ts'
import { TimeEntriesPersistence } from '@/adapter/db/persistence/timeEntriesPersistence.ts'
import { AuthPersistence } from '@/adapter/db/persistence/authPersistence.ts'
import { NotesPersistence } from '@/adapter/db/persistence/notesPersistence.ts'
import { NotesService } from '@/application/service/notesService.ts'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Readable } from 'node:stream'
import { UserService } from '@/application/service/userService.ts'

export type DB = NodePgDatabase<typeof schema> & { $client: Pool } & {
  queryStream: <T>(query: T) => Readable
}

function createContainer() {
  return new Container()
    .add('db', async () => {
      const pool = new Pool({
        connectionString:
          'postgres://postgres_user:password@localhost:5432/postgres_db',
      })
      const client = await pool.connect()
      return drizzle({ client, schema }) as DB
    })
    .add('redis', async () => {
      return (await createClient({
        url: 'redis://localhost:6379',
      }).connect()) as any // as RedisClientType
    })
    .add('tokenService', () => new TokenService())
    .add('authCache', (container) => new RedisAuthCache(container))
    .add('authPersistence', (container) => new AuthPersistence(container))
    .add('userPersistence', (container) => new UserPersistence(container))
    .add(
      'timeEntriesPersistence',
      (container) => new TimeEntriesPersistence(container),
    )
    .add('notesPersistence', (container) => new NotesPersistence(container))
    .add('userService', (container) => new UserService(container))
    .add('authService', (container) => new AuthService(container))
    .add('timeEntriesService', (container) => new TimeEntriesService(container))
    .add('notesService', (container) => new NotesService(container))
}

export const servicesPlugin = new Elysia({ name: 'services' }).decorate(
  await createContainer().buildAsync((key) => {
    console.log(`Instantiating ${key}...`)
  }),
)
