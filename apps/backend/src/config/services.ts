import { Elysia } from 'elysia'
import { Pool } from 'pg'
import { nodeDrizzle } from '@/lib/drizzle/drizzle.ts'
import * as schema from '@/adapter/db/schema/schema.ts'
import { Container } from '@time-app-test/shared/helper/container/container.ts'
import { createClient } from 'redis'
import { TokenService } from '@/application/service/tokenService'
import { RedisAuthCache } from '@/adapter/redis/auth/authCache'
import { AuthPersistence } from '@/adapter/db/persistence/authPersistence'
import { NotesPersistence } from '@/adapter/db/persistence/notesPersistence'
import { AttachmentsPersistence } from '@/adapter/db/persistence/attachmentsPersistence'
import { UserService } from '@/application/service/userService'
import { NotesService } from '@/application/service/notesService'
import { AttachmentsService } from '@/application/service/attachmentsService.ts'
import { AuthService } from '@/application/service/authService.ts'
import { UserPersistence } from '@/adapter/db/persistence/userPersistence.ts'
import { ExtendedDatabaseOrTransaction } from '@/lib/drizzle/types.ts'

export type DB = ExtendedDatabaseOrTransaction<typeof schema>

function createContainer() {
  return new Container()
    .add('config', () => ({
      pgConnectionString:
        'postgres://postgres_user:password@localhost:5432/postgres_db',
      redisConnectionString: 'redis://localhost:6379',
    }))
    .add('db', async ({ config }) => {
      const pool = new Pool({
        connectionString: config.pgConnectionString,
      })
      return await nodeDrizzle({
        client: pool,
        schema,
        casing: 'snake_case',
        logger: true,
      })
    })
    .add('redis', async ({ config }) => {
      return (await createClient({
        url: config.redisConnectionString,
      }).connect()) as any // as RedisClientType
    })
    .add('authCache', (container) => new RedisAuthCache(container))
    .add('tokenService', () => new TokenService())
    .add('authPersistence', (container) => new AuthPersistence(container))
    .add('userPersistence', (container) => new UserPersistence(container))
    .add('notesPersistence', (container) => new NotesPersistence(container))
    .add(
      'attachmentsPersistence',
      (container) => new AttachmentsPersistence(container),
    )
    .add('userService', (container) => new UserService(container))
    .add('authService', (container) => new AuthService(container))
    .add('notesService', (container) => new NotesService(container))
    .add('attachmentsService', (container) => new AttachmentsService(container))
}

export const servicesPlugin = new Elysia({ name: 'services' }).decorate(
  await createContainer().buildAsync((key) => {
    console.log(`Instantiating ${key}...`)
  }),
)
