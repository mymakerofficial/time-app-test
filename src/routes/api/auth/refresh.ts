import { createServerFileRoute } from '@tanstack/react-start/server'
import {
  error,
  generateAccessToken,
  getRefreshTokenCookie,
  routeHandler,
} from '@/lib/backend/utils.ts'
import { AuthRefreshResponseSchema } from '@/lib/schema/auth.ts'
import { refreshTokens } from '@/lib/backend/auth.ts'

export const ServerRoute = createServerFileRoute('/api/auth/refresh').methods({
  POST: routeHandler(async ({ request }) => {
    const refreshToken = getRefreshTokenCookie(request)

    const refreshTokenMeta = refreshTokens.get(refreshToken)

    if (!refreshTokenMeta) {
      error({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token',
        statusCode: 401,
      })
    }

    if (refreshTokenMeta.expiresAt < Date.now()) {
      refreshTokens.delete(refreshToken)

      error({
        code: 'EXPIRED_REFRESH_TOKEN',
        message: 'Refresh token has expired',
        statusCode: 401,
      })
    }

    const accessToken = await generateAccessToken({
      userId: refreshTokenMeta.userId,
    })

    return new Response(
      JSON.stringify(
        AuthRefreshResponseSchema.parse({
          accessToken,
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
