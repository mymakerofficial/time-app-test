import { describe, expect, it } from 'vitest'
import { apiController } from '@/adapter/rest/api.ts'
import { Config } from '@time-app-test/shared/model/domain/config.js'

describe('Elysia', () => {
  it('returns a response', async () => {
    const response = await apiController(
      new Config.ApplicationConfig({
        pgConnectionString: '',
        redisConnectionString: '',
      }),
    ).handle(new Request('http://localhost/api/users/me'))

    expect(await response.json()).toEqual({
      message: 'Access denied because authorization header was missing.',
      errorCode: 'MISSING_AUTHORIZATION_HEADER',
      statusCode: 403,
      parameters: {},
      path: '/api/users/me',
    })
  })
})
