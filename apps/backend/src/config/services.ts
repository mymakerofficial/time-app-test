import { AuthService } from '@/application/service/authService.ts'
import { Elysia } from 'elysia'
import { Container } from '@/lib/container.ts'
import { Pool } from 'pg'
import { drizzle } from '@/lib/drizzle.ts'
import * as schema from '@/adapter/db/schema/schema.ts'
import { TimeEntriesService } from '@/application/service/timeEntriesService.ts'
import { TokenService } from '@/application/service/tokenService.ts'
import { createClient, RedisClientType } from 'redis'
import { RedisAuthCache } from '@/adapter/redis/auth/authCache.ts'
import { UserPersistence } from '@/adapter/db/persistence/userPersistence.ts'
import { TimeEntriesPersistence } from '@/adapter/db/persistence/timeEntriesPersistence.ts'
import { AuthPersistence } from '@/adapter/db/persistence/authPersistence.ts'

const pgPool = new Pool({
  connectionString:
    'postgres://postgres_user:password@localhost:5432/postgres_db',
})
const pgPoolClient = await pgPool.connect()
const db = drizzle({ client: pgPoolClient, schema })
export type DB = typeof db

const redisClient = (await createClient({
  url: 'redis://localhost:6379',
}).connect()) as RedisClientType

export const container = new Container()
  .add('db', () => db)
  .add('redis', () => redisClient)
  .add('tokenService', () => new TokenService())
  .add('authCache', (container) => new RedisAuthCache(container))
  .add('authPersistence', (container) => new AuthPersistence(container))
  .add('userPersistence', (container) => new UserPersistence(container))
  .add(
    'timeEntriesPersistence',
    (container) => new TimeEntriesPersistence(container),
  )
  .add('authService', (container) => new AuthService(container))
  .add('timeEntriesService', (container) => new TimeEntriesService(container))

export const servicesPlugin = new Elysia({ name: 'services' }).derive(
  { as: 'global' },
  () => container.build(),
)
