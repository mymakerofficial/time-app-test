import { z } from 'zod'

export function toSchema(schema: z.ZodType) {
  return z.toJSONSchema(schema, {
    target: 'openapi-3.0',
    unrepresentable: 'any',
    override: (ctx) => {
      const def = ctx.zodSchema._zod.def
      if (def.type === 'date') {
        ctx.jsonSchema.type = 'string'
        ctx.jsonSchema.format = 'date-time'
      }
    },
  })
}
