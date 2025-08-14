import type { ElysiaConfig } from 'elysia/types'
import { Elysia } from 'elysia'
import { services } from '@/services.ts'
import { sessionHelper } from '@/lib/sessionHelper.ts'

export function createApiController<BasePath extends string = ''>(
  config: ElysiaConfig<BasePath>,
) {
  return new Elysia(config).use(services).use(sessionHelper)
}
