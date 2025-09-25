import type { ElysiaConfig } from 'elysia/types'
import { Elysia } from 'elysia'
import { Config } from '@time-app-test/shared/model/domain/config.ts'
import { servicesPlugin } from '@/adapter/rest/plugins/services.ts'
import { sessionPlugin } from '@/adapter/rest/plugins/session.ts'

export function createApiController<BasePath extends string = ''>(
  config: Config.ApplicationConfig,
  elysiaConfig: ElysiaConfig<BasePath>,
) {
  return new Elysia(elysiaConfig)
    .use(servicesPlugin(config))
    .use(sessionPlugin(config))
}
