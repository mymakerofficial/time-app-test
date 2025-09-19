import { Pool } from 'pg'
import type { DrizzleConfig } from 'drizzle-orm/utils'
import { ExtendedDrizzle } from '@/lib/drizzle/types.ts'
import { extendedDrizzleFactory } from '@/lib/drizzle/extension.ts'
import { PGlite } from '@electric-sql/pglite'

export async function nodeDrizzle<
  TSchema extends Record<string, unknown> = Record<string, never>,
>(
  config: DrizzleConfig<TSchema> & {
    client: Pool
  },
): Promise<ExtendedDrizzle<TSchema>> {
  const base = (await import('drizzle-orm/node-postgres')).drizzle(config)
  return extendedDrizzleFactory(base, base.$client, config)
}

export async function pgliteDrizzle<
  TSchema extends Record<string, unknown> = Record<string, never>,
>(
  config: DrizzleConfig<TSchema> & {
    client: PGlite
  },
): Promise<ExtendedDrizzle<TSchema>> {
  const base = (await import('drizzle-orm/pglite')).drizzle(config)
  return extendedDrizzleFactory(base, base.$client, config)
}
