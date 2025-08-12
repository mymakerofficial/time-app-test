import { createServerFileRoute } from '@tanstack/react-start/server'
import { db, errorResponse, getRequestBody } from '@/lib/backend/utils.ts'
import {
  PostAuthLoginStartRequestSchema,
  PostAuthLoginStartResponseSchema,
} from '@/lib/schema/auth.ts'
import { users } from '@/lib/db/schema/schema.ts'
import { eq } from 'drizzle-orm'
import * as SRP from 'secure-remote-password/server'
import { pendingLogins } from '@/lib/backend/auth.ts'

export const ServerRoute = createServerFileRoute(
  '/api/auth/login/start',
).methods({
  POST: async ({ request }) => {
    const body = await getRequestBody({
      request,
      schema: PostAuthLoginStartRequestSchema,
    })

    const [dbUser] = await db
      .select({
        id: users.id,
        salt: users.salt,
        verifier: users.verifier,
      })
      .from(users)
      .where(eq(users.username, body.username))
      .limit(1)

    if (!dbUser) {
      return errorResponse({
        code: 'USER_NOT_FOUND',
        message: 'User with this username does not exist',
      })
    }

    const serverEphemeral = SRP.generateEphemeral(dbUser.verifier)

    pendingLogins.set(dbUser.id, {
      serverSecret: serverEphemeral.secret,
      clientPublic: body.clientPublic,
      salt: dbUser.salt,
      verifier: dbUser.verifier,
    })

    return new Response(
      JSON.stringify(
        PostAuthLoginStartResponseSchema.parse({
          userId: dbUser.id,
          salt: dbUser.salt,
          serverPublic: serverEphemeral.public,
        }),
      ),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )
  },
})
