import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema/schema.ts",
  out: "./src/lib/db/migrations",
  dbCredentials: {
    url: "postgres://postgres_user:password@localhost:5432/postgres_db",
  }
});