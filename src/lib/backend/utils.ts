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
import { ApiError, ApiErrorProps } from '@/lib/error.ts'
import { JWTPayload, jwtVerify, SignJWT } from 'jose'
import {
  ACCESS_TOKEN_EXPIRY_SECONDS,
  JWT_SECRET,
} from '@/lib/backend/constants.ts'
import { Optional } from '@/lib/optional.ts'

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
    throw apiError({
      statusCode: 401,
      errorCode: 'MISSING_AUTHORIZATION',
      message: 'Authorization header is missing',
    })
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw apiError({
      statusCode: 401,
      errorCode: 'INVALID_AUTHORIZATION_FORMAT',
      message: 'Invalid Authorization header format',
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
    throw apiError({
      statusCode: 401,
      errorCode: 'INVALID_JWT_PAYLOAD',
      message: 'Invalid JWT payload',
    })
  }

  return payload as JWTPayload & { sub: string }
}

export function getCookies(request: Request): Record<string, string> {
  const cookieHeader = request.headers.get('Cookie')
  if (!cookieHeader) {
    return {}
  }

  return Object.fromEntries(
    cookieHeader.split('; ').map((cookie) => {
      const [key, value] = cookie.split('=')
      return [key, decodeURIComponent(value)]
    }),
  )
}

export function getRefreshTokenCookie(request: Request) {
  const cookies = getCookies(request)
  return Optional.of(cookies.refreshToken)
}

export function apiError(err: ApiErrorProps): ApiError {
  return ApiError.from(err)
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

export function generateAccessToken({ userId }: { userId: string }) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(
      Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY_SECONDS,
    )
    .sign(JWT_SECRET)
}
