import type { ElysiaConfig } from 'elysia/types'
import { Elysia } from 'elysia'
import { servicesPlugin } from '@/config/services.ts'
import { sessionPlugin } from '@/adapter/rest/utils/sessionPlugin.ts'

export function createApiController<BasePath extends string = ''>(
  config: ElysiaConfig<BasePath>,
) {
  return new Elysia(config).use(servicesPlugin).use(sessionPlugin)
}
