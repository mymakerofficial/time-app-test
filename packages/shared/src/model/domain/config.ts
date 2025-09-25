import { Z } from 'zod-class'
import z from 'zod'

export namespace Config {
  export class ApplicationConfig extends Z.class({
    pgConnectionString: z.string(),
    redisConnectionString: z.string(),
  }) {}
}
