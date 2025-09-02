import { z } from 'zod'
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
  TBodySchema extends z.ZodType | undefined,
  TResponseSchema extends z.ZodType | undefined,
  TValidateSession extends boolean = false,
>(options: {
  body?: TBodySchema
  response?: TResponseSchema
  validateSession?: TValidateSession
}): {
  body: TBodySchema
  response: TResponseSchema
  validateSession: TValidateSession extends true ? true : undefined
} {
  return {
    ...(options.validateSession ? { validateSession: true } : {}),
    body: options.body,
    response: options.response,
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
