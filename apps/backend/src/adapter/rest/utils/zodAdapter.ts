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
  TContentType extends
    | 'application/json'
    | 'multipart/form-data' = 'application/json',
>(options: {
  body?: TBodySchema
  response?: TResponseSchema
  validateSession?: TValidateSession
  encode?: boolean
  parse?: TContentType
}): {
  parse: TContentType
  body: TBodySchema
  response: TResponseSchema
  validateSession: TValidateSession extends true ? true : undefined
  detail: DocumentDecoration
} {
  const encode = options.encode || true
  const contentType = options.parse || 'application/json'

  const isJsonResponse =
    options.response?.type === 'object' || options.response?.type === 'array'
  const responseContentType =
    options.response?.type === 'file'
      ? 'application/octet-stream'
      : 'application/json'

  function encodeData(data: z.output<TResponseSchema>) {
    if (isJsonResponse) {
      return JSON.stringify(options.response!.encode(data))
    }
    return data
  }

  return {
    ...(options.validateSession && {
      validateSession: true as TValidateSession extends true ? true : undefined,
    })!,
    parse: contentType,
    // TODO: add back once stable
    // body: options.body!,
    // response: options.response!,
    ...(options.response &&
      encode && {
        afterHandle: (async ({ response }) => {
          return new Response(
            // @ts-ignore
            encodeData(response),
            {
              headers: {
                'Content-Type': responseContentType,
              },
            },
          )
        }) satisfies AnyLocalHook['afterHandle'],
      }),
    detail: {
      ...(options.body && {
        requestBody: {
          required: true,
          content: {
            [contentType]: {
              schema: toSchema(options.body),
            },
          },
        },
      }),
      responses: {
        ...(options.response
          ? {
              200: {
                content: {
                  [responseContentType]: {
                    schema: toSchema(options.response),
                  },
                },
                description: 'Success',
              },
            }
          : {
              200: {
                description: 'No content',
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
