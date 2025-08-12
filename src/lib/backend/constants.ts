import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { timeEntries, users } from '@/lib/db/schema/schema.ts'

const PG_CONNECTION_STRING =
  'postgres://postgres_user:password@localhost:5432/postgres_db'

export const JWT_SECRET = new TextEncoder().encode('super-secret-change-me')

export const ACCESS_TOKEN_EXPIRY_SECONDS = 60 * 15 // 15 minutes
export const REFRESH_TOKEN_EXPIRY_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

export const pool = new Pool({
  connectionString: PG_CONNECTION_STRING,
})
export const client = await pool.connect()
export const db = drizzle({ client, schema: { timeEntries, users } })
