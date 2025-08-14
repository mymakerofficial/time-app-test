// import { createServerFileRoute } from '@tanstack/react-start/server'
// import {
//   apiError,
//   generateAccessToken,
//   getRequestBody,
//   routeHandler,
// } from '../../../lib/backend/utils.ts'
// import {
//   PostAuthLoginFinishRequestSchema,
//   PostAuthLoginFinishResponseSchema,
// } from '../../../lib/schema/auth.ts'
// import * as srp from 'secure-remote-password/server'
// import { pendingLogins, refreshTokens } from '../../../lib/backend/auth.ts'
// import { REFRESH_TOKEN_EXPIRY_MS } from '../../../lib/backend/constants.ts'
// import * as crypto from 'node:crypto'
//
// export const ServerRoute = createServerFileRoute(
//   '/api/auth/login/finish',
// ).methods({
//   POST: routeHandler(async ({ request }) => {
//     const { userId, clientProof } = await getRequestBody({
//       request,
//       schema: PostAuthLoginFinishRequestSchema,
//     })
//
//     const pending = pendingLogins.get(userId)
//
//     if (!pending) {
//       throw apiError({
//         errorCode: 'INVALID_LOGIN',
//         message: 'User login not found or invalid',
//       })
//     }
//
//     const serverSession = srp.deriveSession(
//       pending.serverSecretEphemeral,
//       pending.clientPublicEphemeral,
//       pending.salt,
//       userId,
//       pending.verifier,
//       clientProof,
//     )
//
//     const accessToken = await generateAccessToken({ userId })
//
//     const refreshToken = crypto.randomBytes(32).toString('hex')
//     refreshTokens.set(refreshToken, {
//       userId,
//       expiresAt: Date.now() + REFRESH_TOKEN_EXPIRY_MS,
//     })
//
//     pendingLogins.delete(userId)
//
//     return new Response(
//       JSON.stringify(
//         PostAuthLoginFinishResponseSchema.parse({
//           serverProof: serverSession.proof,
//           accessToken,
//         }),
//       ),
//       {
//         status: 200,
//         headers: {
//           'Content-Type': 'application/json',
//           'Set-Cookie': `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${REFRESH_TOKEN_EXPIRY_MS}; SameSite=Strict; Secure`,
//         },
//       },
//     )
//   }),
// })
