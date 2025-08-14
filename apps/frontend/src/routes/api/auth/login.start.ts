// import { createServerFileRoute } from '@tanstack/react-start/server'
// import { apiError, getRequestBody, routeHandler } from '../../../lib/backend/utils.ts'
// import {
//   PostAuthLoginStartRequestSchema,
//   PostAuthLoginStartResponseSchema,
// } from '../../../lib/schema/auth.ts'
// import { users } from '../../../lib/db/schema/schema.ts'
// import { eq } from 'drizzle-orm'
// import * as srp from 'secure-remote-password/server'
// import { pendingLogins } from '../../../lib/backend/auth.ts'
// import { db } from '../../../lib/backend/constants.ts'
//
// export const ServerRoute = createServerFileRoute(
//   '/api/auth/login/start',
// ).methods({
//   POST: routeHandler(async ({ request }) => {
//     const { username, clientPublicEphemeral } = await getRequestBody({
//       request,
//       schema: PostAuthLoginStartRequestSchema,
//     })
//
//     const [user] = await db
//       .select({
//         id: users.id,
//         salt: users.salt,
//         verifier: users.verifier,
//       })
//       .from(users)
//       .where(eq(users.username, username))
//       .limit(1)
//
//     if (!user) {
//       throw apiError({
//         errorCode: 'USER_NOT_FOUND',
//         message: 'User with this username does not exist',
//       })
//     }
//
//     const serverEphemeral = srp.generateEphemeral(user.verifier)
//
//     pendingLogins.set(user.id, {
//       serverSecretEphemeral: serverEphemeral.secret,
//       clientPublicEphemeral,
//       salt: user.salt,
//       verifier: user.verifier,
//     })
//
//     return new Response(
//       JSON.stringify(
//         PostAuthLoginStartResponseSchema.parse({
//           userId: user.id,
//           salt: user.salt,
//           serverPublicEphemeral: serverEphemeral.public,
//         }),
//       ),
//       {
//         status: 200,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       },
//     )
//   }),
// })
