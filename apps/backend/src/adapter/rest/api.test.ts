import { describe, expect, it } from 'vitest'
import { apiController } from '@/adapter/rest/api.ts'

describe('Elysia', () => {
  it('returns a response', async () => {
    const response = await apiController.handle(
      new Request('http://localhost/api/users/me'),
    )

    expect(await response.json()).toEqual({
      message: 'Access denied because authorization header was missing.',
      errorCode: 'MISSING_AUTHORIZATION_HEADER',
      statusCode: 403,
      parameters: {},
      path: '/api/users/me',
    })
  })
})
