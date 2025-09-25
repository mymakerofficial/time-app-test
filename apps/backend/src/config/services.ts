import { Pool } from 'pg'
import { nodeDrizzle } from '@/lib/drizzle/drizzle.ts'
import * as schema from '@/adapter/db/schema/schema.ts'
import {
  Container,
  InferContainerShape,
} from '@time-app-test/shared/helper/container/container.ts'
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
import { Config } from '@time-app-test/shared/model/domain/config.ts'

export type DB = ExtendedDatabaseOrTransaction<typeof schema>

export function createBaseContainer(config: Config.ApplicationConfig) {
  return new Container()
    .register('config', () => config)
    .register('db', async ({ config }) => {
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
    .register('redis', async ({ config }) => {
      return (await createClient({
        url: config.redisConnectionString,
      }).connect()) as any // as RedisClientType
    })
}

type BaseContainerShape = InferContainerShape<
  ReturnType<typeof createBaseContainer>
>

export function createServiceContainer(
  base: Container<{}, false, BaseContainerShape, true>,
  transacting: boolean,
) {
  return base
    .extend()
    .registerIf(
      'tx',
      () => transacting,
      async ({ db }) => {
        return db.createTransaction()
      },
    )
    .registerIf(
      'db',
      () => transacting,
      ({ tx }) => tx,
    )
    .register('authCache', (container) => new RedisAuthCache(container))
    .register('tokenService', () => new TokenService())
    .register('authPersistence', (container) => new AuthPersistence(container))
    .register('userPersistence', (container) => new UserPersistence(container))
    .register(
      'notesPersistence',
      (container) => new NotesPersistence(container),
    )
    .register(
      'attachmentsPersistence',
      (container) => new AttachmentsPersistence(container),
    )
    .register('userService', (container) => new UserService(container))
    .register('authService', (container) => new AuthService(container))
    .register('notesService', (container) => new NotesService(container))
    .register(
      'attachmentsService',
      (container) => new AttachmentsService(container),
    )
}
