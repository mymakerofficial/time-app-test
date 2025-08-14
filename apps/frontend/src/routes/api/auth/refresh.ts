// import { createServerFileRoute } from '@tanstack/react-start/server'
// import {
//   apiError,
//   generateAccessToken,
//   getRefreshTokenCookie,
//   routeHandler,
// } from '../../../lib/backend/utils.ts'
// import { AuthRefreshResponseSchema } from '../../../lib/schema/auth.ts'
// import { refreshTokens } from '../../../lib/backend/auth.ts'
// import { Optional } from '../../../lib/optional.ts'
//
// export const ServerRoute = createServerFileRoute('/api/auth/refresh').methods({
//   POST: routeHandler(async ({ request }) => {
//     const refreshToken = getRefreshTokenCookie(request).getOrThrow(() =>
//       apiError({
//         errorCode: 'MISSING_REFRESH_TOKEN',
//         message: 'Refresh token cookie is missing',
//         statusCode: 401,
//       }),
//     )
//
//     const { userId, expiresAt } = Optional.of(
//       refreshTokens.get(refreshToken),
//     ).getOrThrow(() =>
//       apiError({
//         errorCode: 'INVALID_REFRESH_TOKEN',
//         message: 'Invalid or expired refresh token',
//         statusCode: 401,
//       }),
//     )
//
//     if (expiresAt < Date.now()) {
//       refreshTokens.delete(refreshToken)
//
//       throw apiError({
//         errorCode: 'EXPIRED_REFRESH_TOKEN',
//         message: 'Refresh token has expired',
//         statusCode: 401,
//       })
//     }
//
//     const accessToken = await generateAccessToken({
//       userId: userId,
//     })
//
//     return new Response(
//       JSON.stringify(
//         AuthRefreshResponseSchema.parse({
//           accessToken,
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
