import { t } from 'elysia'

export namespace AuthModel {
  export const RegisterStartBody = t.Object({
    username: t.String(),
  })
  export type RegisterStartBody = typeof RegisterStartBody.static

  export const RegisterStartResponse = t.Object({
    userId: t.String(),
  })
  export type RegisterStartResponse = typeof RegisterStartResponse.static

  export const RegisterFinishBody = t.Object({
    username: t.String(),
    userId: t.String(),
    salt: t.String(),
    verifier: t.String(),
  })
  export type RegisterFinishBody = typeof RegisterFinishBody.static

  export const LoginStartBody = t.Object({
    username: t.String(),
    clientPublicEphemeral: t.String(),
  })
  export type LoginStartBody = typeof LoginStartBody.static

  export const LoginStartResponse = t.Object({
    userId: t.String(),
    salt: t.String(),
    serverPublicEphemeral: t.String(),
  })
  export type LoginStartResponse = typeof LoginStartResponse.static

  export const LoginFinishBody = t.Object({
    userId: t.String(),
    clientProof: t.String(),
  })
  export type LoginFinishBody = typeof LoginFinishBody.static

  export const LoginFinishResponse = t.Object({
    serverProof: t.String(),
    accessToken: t.String(),
  })
  export type LoginFinishResponse = typeof LoginFinishResponse.static
}
