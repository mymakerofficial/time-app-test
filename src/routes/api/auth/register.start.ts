import { createServerFileRoute } from '@tanstack/react-start/server'
import { apiError, getRequestBody, routeHandler } from '@/lib/backend/utils.ts'
import {
  PostAuthRegisterStartRequestSchema,
  PostAuthRegisterStartResponseSchema,
} from '@/lib/schema/auth.ts'
import { nanoid } from 'nanoid'
import { users } from '@/lib/db/schema/schema.ts'
import { eq, or } from 'drizzle-orm'
import { pendingRegistrations } from '@/lib/backend/auth.ts'
import { db } from '@/lib/backend/constants.ts'

export const ServerRoute = createServerFileRoute(
  '/api/auth/register/start',
).methods({
  POST: routeHandler(async ({ request }) => {
    const { username } = await getRequestBody({
      request,
      schema: PostAuthRegisterStartRequestSchema,
    })

    const userId = nanoid()

    const existing = await db.$count(
      db
        .select()
        .from(users)
        .where(or(eq(users.username, username), eq(users.id, userId))),
    )

    if (existing > 0) {
      throw apiError({
        errorCode: 'USER_EXISTS',
        message: 'User with this username or ID already exists',
      })
    }

    pendingRegistrations.set(userId, { username })

    return new Response(
      JSON.stringify(
        PostAuthRegisterStartResponseSchema.parse({
          userId,
        }),
      ),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  }),
})
