import { z } from 'zod'
import { DocumentDecoration } from 'elysia/types'
import { ApiErrorResponseSchema } from '@time-app-test/shared/error/schema.ts'

function toSchema(schema: z.ZodType) {
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
  }) as any
}

export function createLocalHook<
  TValidateSession extends boolean = false,
>(options: {
  body?: z.ZodType
  response?: z.ZodType
  validateSession?: TValidateSession
}): {
  parse: 'none'
  detail: DocumentDecoration
  validateSession: TValidateSession extends true ? true : undefined
} {
  return {
    ...(options.validateSession ? { validateSession: true } : {}),
    parse: 'none',
    detail: {
      ...(options.body
        ? {
            requestBody: {
              content: {
                'application/json': {
                  schema: toSchema(options.body),
                },
              },
            },
          }
        : {}),
      responses: {
        ...(options.response
          ? {
              200: {
                content: {
                  'application/json': {
                    schema: toSchema(options.response),
                  },
                },
              },
            }
          : {}),
        500: {
          content: {
            'application/json': {
              schema: toSchema(ApiErrorResponseSchema),
            },
          },
        },
      },
      ...(options.validateSession
        ? {
            parameters: [
              {
                schema: {
                  type: 'string',
                  pattern: '^Bearer .+$',
                },
                in: 'header',
                name: 'authorization',
              },
            ],
          }
        : {}),
    },
  }
}
