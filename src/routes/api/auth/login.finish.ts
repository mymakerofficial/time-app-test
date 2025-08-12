import { createServerFileRoute } from '@tanstack/react-start/server'
import { error, getRequestBody, routeHandler } from '@/lib/backend/utils.ts'
import {
  PostAuthLoginFinishRequestSchema,
  PostAuthLoginFinishResponseSchema,
} from '@/lib/schema/auth.ts'
import * as SRP from 'secure-remote-password/server'
import { pendingLogins } from '@/lib/backend/auth.ts'

export const ServerRoute = createServerFileRoute(
  '/api/auth/login/finish',
).methods({
  POST: routeHandler(async ({ request }) => {
    const body = await getRequestBody({
      request,
      schema: PostAuthLoginFinishRequestSchema,
    })

    const pending = pendingLogins.get(body.userId)

    if (!pending) {
      error({
        code: 'INVALID_LOGIN',
        message: 'User login not found or invalid',
      })
    }

    const serverSession = SRP.deriveSession(
      pending.serverSecret,
      pending.clientPublic,
      pending.salt,
      body.userId,
      pending.verifier,
      body.clientProof,
    )

    pendingLogins.delete(body.userId)

    return new Response(
      JSON.stringify(
        PostAuthLoginFinishResponseSchema.parse({
          serverProof: serverSession.proof,
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
