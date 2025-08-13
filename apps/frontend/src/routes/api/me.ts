import { createServerFileRoute } from '@tanstack/react-start/server'
import { routeHandler, validateAuthHeader } from '../../lib/backend/utils.ts'
import { db } from '../../lib/backend/constants.ts'
import { users } from '../../lib/db/schema/schema.ts'
import { eq } from 'drizzle-orm'

export const ServerRoute = createServerFileRoute('/api/me').methods({
  GET: routeHandler(async ({ request }) => {
    const { sub } = await validateAuthHeader(request)

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, sub))
      .limit(1)

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }),
})
