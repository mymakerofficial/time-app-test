import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/adapter/db/schema/schema.ts',
  out: './src/adapter/db/migrations',
  dbCredentials: {
    url: 'postgres://postgres_user:password@localhost:5432/postgres_db',
  },
})
