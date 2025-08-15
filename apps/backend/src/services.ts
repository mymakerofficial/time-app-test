import { AuthService } from '@/domain/auth/service.ts'
import { Elysia } from 'elysia'
import { Container } from '@/lib/container.ts'
import { Pool } from 'pg'
import { drizzle } from '@/lib/drizzle.ts'
import * as schema from '@/db/schema/schema.ts'
import { TimeEntriesService } from '@/domain/timeEntries/service.ts'
import { TokenService } from '@/domain/token/service.ts'

const pool = new Pool({
  connectionString:
    'postgres://postgres_user:password@localhost:5432/postgres_db',
})
const poolClient = await pool.connect()
const db = drizzle({ client: poolClient, schema })
export type DB = typeof db

export const container = new Container()
  .add('db', () => db)
  .add('tokenService', () => new TokenService())
  .add('authService', (container) => new AuthService(container))
  .add('timeEntriesService', (container) => new TimeEntriesService(container))

export const services = new Elysia({ name: 'services' }).derive(
  { as: 'global' },
  () => container.build(),
)
