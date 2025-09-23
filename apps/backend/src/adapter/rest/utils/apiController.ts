import type { ElysiaConfig } from 'elysia/types'
import { Elysia } from 'elysia'
import { sessionPlugin } from '@/adapter/rest/plugins/session.ts'

export function createApiController<BasePath extends string = ''>(
  config: ElysiaConfig<BasePath>,
) {
  return new Elysia(config).use(sessionPlugin)
}
