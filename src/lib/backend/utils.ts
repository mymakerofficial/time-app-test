import { PoolClient } from 'pg'
import { z } from 'zod'
import msgpack from '@ygoe/msgpack'
import { PgSelect } from 'drizzle-orm/pg-core'
import QueryStream from 'pg-query-stream'
import {
  AnyServerRouteWithTypes,
  ServerRouteMethodHandlerCtx,
  ServerRouteMethodHandlerFn,
} from '@tanstack/start-server-core'
import { ApiError } from '@/lib/backend/error.ts'
import { ApiErrorResponse } from '@/lib/schema/error.ts'
import { JWTPayload, jwtVerify } from 'jose'
import { JWT_SECRET } from '@/lib/backend/constants.ts'

export function drizzleQueryStream<T extends { toSQL: PgSelect['toSQL'] }>(
  client: PoolClient,
  query: T,
) {
  const sql = query.toSQL()
  return client.query(new QueryStream(sql.sql, sql.params))
}

export function getParams<T extends z.ZodObject>({
  request,
  schema,
}: {
  request: Request
  schema: T
}): z.infer<T> {
  const url = new URL(request.url)
  const params: Record<string, string> = {}
  for (const [key, value] of url.searchParams.entries()) {
    params[key] = value
  }
  return schema.parse(params)
}

export async function getRequestBody<T extends z.ZodTypeAny>({
  request,
  schema,
}: {
  request: Request
  schema: T
}): Promise<z.infer<T>> {
  const data = await request.json()
  return schema.parse(data)
}

export async function getEncodedBody<T extends z.ZodTypeAny>({
  request,
  schema,
}: {
  request: Request
  schema: T
}): Promise<z.infer<T>> {
  const data = await request.bytes()
  return schema.parse(msgpack.decode(data))
}

export function createEncodedStream<T extends z.ZodTypeAny>({
  schema,
  handler,
}: {
  schema: T
  handler: (
    controller: ReadableStreamDefaultController<z.infer<T>>,
  ) => void | Promise<void>
}): ReadableStream {
  return new ReadableStream({
    start: handler,
  }).pipeThrough(
    new TransformStream({
      transform: (chunk, controller) => {
        controller.enqueue(msgpack.encode(schema.parse(chunk)))
      },
    }),
  )
}

export function getAuthHeader(request: Request): string {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    throw new ApiError('Authorization header is missing', {
      statusCode: 401,
      errorCode: 'MISSING_AUTHORIZATION',
    })
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new ApiError('Invalid Authorization header format', {
      statusCode: 401,
      errorCode: 'INVALID_AUTHORIZATION_FORMAT',
    })
  }

  return parts[1]
}

export async function validateAuthHeader(request: Request) {
  const authHeader = getAuthHeader(request)

  const { payload } = await jwtVerify(authHeader, JWT_SECRET, {
    algorithms: ['HS256'],
  })

  if (!payload || typeof payload !== 'object' || !('sub' in payload)) {
    throw new ApiError('Invalid JWT payload', {
      statusCode: 401,
      errorCode: 'INVALID_JWT_PAYLOAD',
    })
  }

  return payload as JWTPayload & { sub: string }
}

export function error(err: ApiErrorResponse): never {
  throw ApiError.fromApiErrorResponse(err)
}

export function routeHandler<
  TParentRoute extends AnyServerRouteWithTypes,
  TFullPath extends string,
  TMiddlewares,
>(
  handler: ServerRouteMethodHandlerFn<
    TParentRoute,
    TFullPath,
    TMiddlewares,
    undefined,
    any
  >,
): ServerRouteMethodHandlerFn<
  TParentRoute,
  TFullPath,
  TMiddlewares,
  undefined,
  any
> {
  return async (
    ctx: ServerRouteMethodHandlerCtx<
      TParentRoute,
      TFullPath,
      TMiddlewares,
      undefined
    >,
  ) => {
    try {
      return await handler(ctx)
    } catch (error) {
      console.error(error)
      const appError = ApiError.fromUnknown(error)
      return new Response(appError.toJSON(), {
        status: appError.statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
  }
}
