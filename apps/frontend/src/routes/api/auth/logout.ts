// import { createServerFileRoute } from '@tanstack/react-start/server'
// import { getRefreshTokenCookie, routeHandler } from '../../../lib/backend/utils.ts'
// import { refreshTokens } from '../../../lib/backend/auth.ts'
//
// export const ServerRoute = createServerFileRoute('/api/auth/logout').methods({
//   POST: routeHandler(async ({ request }) => {
//     getRefreshTokenCookie(request).with((it) => {
//       refreshTokens.delete(it)
//     })
//
//     return new Response(undefined, {
//       status: 200,
//       headers: {
//         'Set-Cookie': `refreshToken=deleted; HttpOnly; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
//       },
//     })
//   }),
// })
