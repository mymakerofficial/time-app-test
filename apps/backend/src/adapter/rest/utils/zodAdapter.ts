import { z } from 'zod'
import { ApiErrorResponseSchema } from '@time-app-test/shared/error/schema.ts'
import { DocumentDecoration, LocalHook } from 'elysia/types'

type AnyLocalHook = LocalHook<
  {},
  {},
  {
    decorator: {}
    store: {}
    derive: {}
    resolve: {}
  },
  {}
>

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
  encode?: boolean
}): {
  body: TBodySchema
  response: TResponseSchema
  validateSession: TValidateSession extends true ? true : undefined
  detail: DocumentDecoration
} {
  const encode = options.encode || true

  return {
    ...(options.validateSession && {
      validateSession: true as TValidateSession extends true ? true : undefined,
    })!,
    body: options.body!,
    response: options.response!,
    ...(options.response &&
      encode && {
        afterHandle: (async ({ response }) => {
          return new Response(
            JSON.stringify(await options.response!.encodeAsync(response)),
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
        }) satisfies AnyLocalHook['afterHandle'],
      }),
    detail: {
      ...(options.body && {
        requestBody: {
          content: {
            'application/json': {
              schema: toSchema(options.body),
            },
          },
        },
      }),
      responses: {
        ...(options.response && {
          200: {
            content: {
              'application/json': {
                schema: toSchema(options.response),
              },
            },
            description: '',
          },
        }),
        500: {
          content: {
            'application/json': {
              schema: toSchema(ApiErrorResponseSchema),
            },
          },
          description: 'Something went wrong.',
        },
      },
      ...(options.validateSession && {
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
      }),
    },
  }
}
