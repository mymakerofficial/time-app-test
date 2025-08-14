import { JwtService } from '@/modules/jwt/service.ts'
import { AuthService } from '@/modules/auth/service.ts'
import { Elysia } from 'elysia'
import { Container } from '@/lib/container.ts'
import { Pool } from 'pg'
import { drizzle } from '@/lib/drizzle.ts'
import * as schema from '@/db/schema/schema.ts'

const pool = new Pool({
  connectionString:
    'postgres://postgres_user:password@localhost:5432/postgres_db',
})
const poolClient = await pool.connect()
const db = drizzle({ client: poolClient, schema })
export type DB = typeof db

export const container = new Container()
  .add('db', () => db)
  .add('jwtService', () => new JwtService())
  .add('authService', (container) => new AuthService(container))

export const services = new Elysia({ name: 'services' }).derive(
  { as: 'global' },
  () => container.build(),
)
