import { createServerFileRoute } from '@tanstack/react-start/server'
import { db, errorResponse, getRequestBody } from '@/lib/backend/utils.ts'
import { PostAuthRegisterFinishRequestSchema } from '@/lib/schema/auth.ts'
import { pendingRegistrations } from '@/lib/backend/auth.ts'
import { users } from '@/lib/db/schema/schema.ts'

export const ServerRoute = createServerFileRoute(
  '/api/auth/register/finish',
).methods({
  POST: async ({ request }) => {
    const body = await getRequestBody({
      request,
      schema: PostAuthRegisterFinishRequestSchema,
    })

    const pending = pendingRegistrations.get(body.userId)

    if (!pending || pending.username !== body.username) {
      return errorResponse({
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
  },
})
