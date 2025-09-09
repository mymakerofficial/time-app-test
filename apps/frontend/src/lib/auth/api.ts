import {
  AddAuthFinishBody,
  AddAuthFinishBodySchema,
  AddAuthStartBody,
  AddAuthStartBodySchema,
  AddAuthStartResponseSchema,
  GetTokenResponseSchema,
  LoginFinishBody,
  LoginFinishBodySchema,
  LoginFinishResponseSchema,
  LoginStartBody,
  LoginStartBodySchema,
  LoginStartResponseSchema,
  RegisterFinishBody,
  RegisterFinishBodySchema,
  RegisterStartBody,
  RegisterStartBodySchema,
  RegisterStartResponseSchema,
} from '@time-app-test/shared/model/rest/auth.ts'
import { getResponseBody } from '@time-app-test/shared/fetch/response.ts'
import { SessionContext, useSession } from '@/lib/authStore.ts'

export class AuthApi {
  private readonly getAccessToken: () => string

  constructor(session: SessionContext) {
    this.getAccessToken = session.getAccessToken
  }

  async startRegistration(data: RegisterStartBody) {
    const response = await fetch('/api/auth/register/start', {
      method: 'POST',
      body: JSON.stringify(RegisterStartBodySchema.parse(data)),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return getResponseBody({
      response,
      schema: RegisterStartResponseSchema,
    })
  }

  async finishRegistration(data: RegisterFinishBody) {
    const response = await fetch('/api/auth/register/finish', {
      method: 'POST',
      body: JSON.stringify(RegisterFinishBodySchema.parse(data)),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    await getResponseBody({
      response,
    })
  }

  async startAddAuth(data: AddAuthStartBody) {
    const response = await fetch('/api/auth/add/start', {
      method: 'POST',
      body: JSON.stringify(AddAuthStartBodySchema.parse(data)),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
    })
    return getResponseBody({
      response,
      schema: AddAuthStartResponseSchema,
    })
  }

  async finishAddAuth(data: AddAuthFinishBody) {
    const response = await fetch('/api/auth/add/finish', {
      method: 'POST',
      body: JSON.stringify(AddAuthFinishBodySchema.parse(data)),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
    })
    await getResponseBody({
      response,
    })
  }

  async startLogin(data: LoginStartBody) {
    const response = await fetch('/api/auth/login/start', {
      method: 'POST',
      body: JSON.stringify(LoginStartBodySchema.parse(data)),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return getResponseBody({
      response,
      schema: LoginStartResponseSchema,
    })
  }

  async finishLogin(data: LoginFinishBody) {
    const response = await fetch('/api/auth/login/finish', {
      method: 'POST',
      body: JSON.stringify(LoginFinishBodySchema.parse(data)),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return getResponseBody({
      response,
      schema: LoginFinishResponseSchema,
    })
  }

  async getToken() {
    const response = await fetch('/api/auth/get-token', {
      method: 'POST',
    })
    return await getResponseBody({
      response,
      schema: GetTokenResponseSchema,
    })
  }

  async logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getAccessToken()}`,
      },
    })
  }
}

export function useAuthApi() {
  const session = useSession()
  return new AuthApi(session)
}
