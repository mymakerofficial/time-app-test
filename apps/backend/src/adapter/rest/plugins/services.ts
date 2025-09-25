import { Elysia } from 'elysia'
import {
  createBaseContainer,
  createServiceContainer,
} from '@/config/services.ts'
import { Config } from '@time-app-test/shared/model/domain/config.ts'

export function servicesPlugin(config: Config.ApplicationConfig) {
  const baseContainer = createBaseContainer(config)
  const serviceContainer = createServiceContainer(baseContainer, false)

  return new Elysia({ name: 'services' })
    .onStart(() => {
      console.log('Using services plugin')
    })
    .resolve({ as: 'global' }, async () => {
      await baseContainer.prepareAsync({
        logger: (name) =>
          console.log(`[Base Container] Instantiating ${name}...`),
      })
      return await serviceContainer.buildAsync({
        logger: (name) =>
          console.log(`[Service Container] Instantiating ${name}...`),
      })
    })
    .macro({
      transacting: {
        resolve: async () => {
          return await createServiceContainer(baseContainer, true).buildAsync({
            logger: (name) =>
              console.log(
                `[Transacting Service Container] Instantiating ${name}...`,
              ),
          })
        },
        afterResponse: async ({ tx }) => {
          await tx?.commit()
        },
      },
    })
    .onError({ as: 'global' }, async ({ tx }) => {
      await tx?.rollback()
    })
}
