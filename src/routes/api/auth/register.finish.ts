import { createServerFileRoute } from '@tanstack/react-start/server'
import { error, getRequestBody, routeHandler } from '@/lib/backend/utils.ts'
import { PostAuthRegisterFinishRequestSchema } from '@/lib/schema/auth.ts'
import { pendingRegistrations } from '@/lib/backend/auth.ts'
import { users } from '@/lib/db/schema/schema.ts'
import { db } from '@/lib/backend/constants.ts'

export const ServerRoute = createServerFileRoute(
  '/api/auth/register/finish',
).methods({
  POST: routeHandler(async ({ request }) => {
    const body = await getRequestBody({
      request,
      schema: PostAuthRegisterFinishRequestSchema,
    })

    const pending = pendingRegistrations.get(body.userId)

    if (!pending || pending.username !== body.username) {
      error({
        code: 'INVALID_REGISTRATION',
        message: 'User registration not found or invalid',
      })
    }

    pendingRegistrations.delete(body.userId)

    await db.insert(users).values({
      id: body.userId,
      username: body.username,
      salt: body.salt,
      verifier: body.verifier,
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }),
})
