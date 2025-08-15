import { AuthService } from '@/domain/auth/service.ts'
import { Elysia } from 'elysia'
import { Container } from '@/lib/container.ts'
import { Pool } from 'pg'
import { drizzle } from '@/lib/drizzle.ts'
import * as schema from '@/db/schema/schema.ts'
import { TimeEntriesService } from '@/domain/timeEntries/service.ts'
import { TokenService } from '@/domain/token/service.ts'
import { createClient, RedisClientType } from 'redis'
import { RedisAuthRepository } from '@/domain/auth/repository.ts'

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
  .add('authRepository', (container) => new RedisAuthRepository(container))
  .add('authService', (container) => new AuthService(container))
  .add('timeEntriesService', (container) => new TimeEntriesService(container))

export const services = new Elysia({ name: 'services' }).derive(
  { as: 'global' },
  () => container.build(),
)
